import { getOperatorSession } from "@/lib/control/session";
import { updateOnboardingJobStage } from "@/lib/control/store";
import type { OnboardingStage } from "@/lib/control/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getOperatorSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      jobId?: string;
      stage?: OnboardingStage;
      operatorNotes?: string;
    };

    const snapshot = await updateOnboardingJobStage({
      jobId: payload.jobId ?? "",
      stage: payload.stage ?? "identity-review",
      operatorNotes: payload.operatorNotes ?? "",
      requestedBy: session.subject,
    });

    return Response.json({ snapshot });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update the onboarding job.",
      },
      { status: 400 },
    );
  }
}
