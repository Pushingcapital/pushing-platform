import {
  createOnboardingJob,
  recordOnboardingContactSync,
  recordDocuSignEnvelopeDispatch,
  recordOnboardingServiceRequestSync,
} from "@/lib/control/store";
import type { DriverLicenseParseResult } from "@/lib/control/types";
import { parseDriverLicenseText } from "@/lib/google-vision";
import { syncOnboardingServiceRequest } from "@/lib/platform-service-requests";
import {
  buildMutualNdaDispatchFailureReceipt,
  sendMutualNdaEnvelopeForOnboardingJob,
} from "@/lib/onboarding/mutual-nda";
import {
  buildPublicIntakeMetadata,
  syncPublicIntakeContact,
} from "@/lib/public-intake";
import { classifyOnboardingLane } from "@/lib/service-request-routing";
import { syncOnboardingJobToWebhookHub } from "@/lib/webhook-hub";

export const dynamic = "force-dynamic";

function normalizeSubmittedLicenseParse(
  licenseParse: DriverLicenseParseResult | undefined,
) {
  if (!licenseParse) {
    return undefined;
  }

  if (!licenseParse.rawText.trim()) {
    return licenseParse;
  }

  return parseDriverLicenseText({
    rawText: licenseParse.rawText,
    fileName: licenseParse.fileName,
    mimeType: licenseParse.mimeType,
    confidence: licenseParse.confidence,
    documentSignals: licenseParse.documentSignals,
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
      website?: string;
      metadata?: {
        pageUrl?: string;
        pagePath?: string;
        referrer?: string;
        browserLanguage?: string;
        browserTimeZone?: string;
        screenWidth?: number | null;
        screenHeight?: number | null;
        viewportWidth?: number | null;
        viewportHeight?: number | null;
        utmSource?: string | null;
        utmMedium?: string | null;
        utmCampaign?: string | null;
        utmTerm?: string | null;
        utmContent?: string | null;
        gclid?: string | null;
        fbclid?: string | null;
      };
      intakeAudience?:
        | "employee"
        | "subcontractor"
        | "service-buyer"
        | "software-buyer";
      serviceFamily?: "finance" | "automotive";
      licenseParse?: DriverLicenseParseResult;
    };

    if ((payload.website ?? "").trim()) {
      return Response.json({ ok: true, spam: true });
    }

    const firstName = payload.firstName ?? "";
    const lastName = payload.lastName ?? "";
    const phone = payload.phone ?? "";
    const email = payload.email ?? "";
    const intakeMetadata = buildPublicIntakeMetadata({
      request,
      browserMetadata: payload.metadata,
    });
    const normalizedLicenseParse = normalizeSubmittedLicenseParse(
      payload.licenseParse,
    );
    const laneClassification = classifyOnboardingLane({
      intakeAudience: payload.intakeAudience ?? "service-buyer",
      serviceFamily: payload.serviceFamily ?? "automotive",
      metadata: intakeMetadata,
      licenseParse: normalizedLicenseParse,
    });

    const created = await createOnboardingJob({
      firstName,
      lastName,
      phone,
      email,
      intakeMetadata,
      laneClassification,
      licenseParse: normalizedLicenseParse,
    });
    const initialContactSync = await syncPublicIntakeContact({
      firstName,
      lastName,
      phone,
      email,
      metadata: intakeMetadata,
      laneClassification,
      licenseParse: normalizedLicenseParse,
      onboardingJobId: created.job.id,
    });
    const withContactSync = await recordOnboardingContactSync({
      jobId: created.job.id,
      requestedBy: "public-intake",
      contactSync: initialContactSync,
    });
    const serviceRequestSync = await syncOnboardingServiceRequest({
      firstName,
      lastName,
      phone,
      email,
      onboardingJobId: withContactSync.job.id,
      metadata: intakeMetadata,
      laneClassification,
      licenseParse: normalizedLicenseParse,
    });
    const withServiceRequestSync = await recordOnboardingServiceRequestSync({
      jobId: withContactSync.job.id,
      requestedBy: "public-intake",
      serviceRequestSync,
    });
    const webhookHubSync = await syncOnboardingJobToWebhookHub({
      job: withServiceRequestSync.job,
    });
    const docuSignEnvelope =
      webhookHubSync.status === "mirrored"
        ? await sendMutualNdaEnvelopeForOnboardingJob({
            job: withServiceRequestSync.job,
          }).catch((error) =>
            buildMutualNdaDispatchFailureReceipt({
              job: withServiceRequestSync.job,
              detail:
                error instanceof Error
                  ? error.message
                  : "Unable to send the Mutual NDA through DocuSign.",
            }),
          )
        : buildMutualNdaDispatchFailureReceipt({
            job: withContactSync.job,
            detail:
              webhookHubSync.status === "disabled"
                ? "Mutual NDA send is blocked because the Cloudflare webhook hub token is not configured yet."
                : "Mutual NDA send is blocked because the onboarding job could not be mirrored into the Cloudflare webhook hub first.",
            warnings: [webhookHubSync.detail],
          });
    const recorded = await recordDocuSignEnvelopeDispatch({
      jobId: withServiceRequestSync.job.id,
      requestedBy: "public-intake",
      envelope: docuSignEnvelope,
    });
    const finalContactSync =
      docuSignEnvelope.envelopeId || docuSignEnvelope.templateId
        ? await syncPublicIntakeContact({
            firstName,
            lastName,
            phone,
            email,
            metadata: intakeMetadata,
            laneClassification,
            serviceRequestSync,
            licenseParse: normalizedLicenseParse,
            onboardingJobId: recorded.job.id,
            docuSignEnvelope,
          })
        : initialContactSync;
    const finalRecorded =
      finalContactSync === initialContactSync
        ? recorded
        : await recordOnboardingContactSync({
            jobId: recorded.job.id,
            requestedBy: "public-intake",
            contactSync: finalContactSync,
          });
    const finalWebhookHubSync = await syncOnboardingJobToWebhookHub({
      job: finalRecorded.job,
    });

    return Response.json({
      job: finalRecorded.job,
      laneClassification,
      contactSync: finalContactSync,
      serviceRequestSync,
      webhookHubSync,
      finalWebhookHubSync,
      docuSignEnvelope,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create the onboarding job.",
      },
      { status: 400 },
    );
  }
}
