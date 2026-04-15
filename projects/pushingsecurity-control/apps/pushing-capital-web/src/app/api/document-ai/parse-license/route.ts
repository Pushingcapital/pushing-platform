import { readSecretValue } from "@/lib/control/store";
import { parseDriversLicenseWithGoogleVision } from "@/lib/google-vision";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "Attach a driver license image first." },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return Response.json(
        { error: "The uploaded file is empty." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return Response.json(
        { error: "Driver license uploads must stay under 10 MB." },
        { status: 400 },
      );
    }

    if (file.type && !ACCEPTED_MIME_TYPES.has(file.type)) {
      return Response.json(
        {
          error:
            "Upload a JPG, PNG, WebP, HEIC, or HEIF image for driver-license parsing.",
        },
        { status: 400 },
      );
    }

    const licenseParse = await parseDriversLicenseWithGoogleVision({
      bytes: Buffer.from(await file.arrayBuffer()),
      fileName: file.name || null,
      mimeType: file.type || null,
      readSecretValue,
    });

    return Response.json({ licenseParse });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to parse the submitted driver license.",
      },
      { status: 500 },
    );
  }
}
