import {
  searchCreditReportFiles,
  listRecentFiles,
  downloadFile,
  type DriveFile,
} from "@/lib/google-drive";

export const dynamic = "force-dynamic";

// ── GET /api/credit-report ────────────────────────────────────────────────
// Searches the delegated user's Google Drive for credit report files.
//
// Query params:
//   ?action=search       → Search for credit-related files (default)
//   ?action=recent       → List 30 most recent Drive files
//   ?action=download&id= → Download a specific file by ID (returns binary)
// ──────────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "search";
  const fileId = url.searchParams.get("id");

  try {
    // ── Download a specific file ──────────────────────────────────────
    if (action === "download" && fileId) {
      const { buffer, mimeType, name } = await downloadFile(fileId);
      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `inline; filename="${encodeURIComponent(name)}"`,
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    // ── Search for credit report files ────────────────────────────────
    if (action === "search") {
      const files = await searchCreditReportFiles();
      return Response.json({
        ok: true,
        count: files.length,
        files: files.map(formatFile),
      });
    }

    // ── List recent files ─────────────────────────────────────────────
    if (action === "recent") {
      const files = await listRecentFiles();
      return Response.json({
        ok: true,
        count: files.length,
        files: files.map(formatFile),
      });
    }

    return Response.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[credit-report] Error:", message);

    // Differentiate auth errors from other errors
    const isAuthError =
      message.includes("insufficient") ||
      message.includes("access_denied") ||
      message.includes("unauthorized") ||
      message.includes("delegation");

    return Response.json(
      {
        ok: false,
        error: isAuthError
          ? "Drive access not authorized. Add https://www.googleapis.com/auth/drive.readonly to the Workspace domain-wide delegation for the service account."
          : message,
        authError: isAuthError,
      },
      { status: isAuthError ? 403 : 500 },
    );
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

function formatFile(f: DriveFile) {
  return {
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    modifiedTime: f.modifiedTime,
    size: f.size ? `${(parseInt(f.size) / 1024).toFixed(1)} KB` : null,
    webViewLink: f.webViewLink,
    thumbnailLink: f.thumbnailLink,
    // Generate our internal download URL
    downloadUrl: `/api/credit-report?action=download&id=${f.id}`,
    isPdf: f.mimeType === "application/pdf",
    isImage: f.mimeType?.startsWith("image/"),
    isGoogleDoc: f.mimeType?.startsWith("application/vnd.google-apps."),
  };
}
