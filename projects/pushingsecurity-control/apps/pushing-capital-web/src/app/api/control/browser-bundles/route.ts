import { getOperatorSession } from "@/lib/control/session";
import { upsertBrowserBundle } from "@/lib/control/store";
import type { ManagedBookmark } from "@/lib/control/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getOperatorSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      name?: string;
      description?: string;
      homepageUrl?: string;
      startupUrls?: string[];
      extensionIds?: string[];
      managedBookmarks?: ManagedBookmark[];
    };

    const snapshot = await upsertBrowserBundle({
      name: payload.name ?? "",
      description: payload.description ?? "",
      homepageUrl: payload.homepageUrl ?? "",
      startupUrls: payload.startupUrls ?? [],
      extensionIds: payload.extensionIds ?? [],
      managedBookmarks: payload.managedBookmarks ?? [],
    });

    return Response.json({ snapshot });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save browser bundle.",
      },
      { status: 400 },
    );
  }
}
