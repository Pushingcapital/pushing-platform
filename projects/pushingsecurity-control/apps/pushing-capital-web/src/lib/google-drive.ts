import "server-only";

import { google } from "googleapis";

// ── Auth ──────────────────────────────────────────────────────────────────
// Uses the Workspace service account with domain-wide delegation.
// The admin must authorize:
//   https://www.googleapis.com/auth/drive.readonly
// under Security → API Controls → Domain-wide Delegation for the
// service account client ID.
// ──────────────────────────────────────────────────────────────────────────

function getDriveAuth() {
  const clientEmail = process.env.GOOGLE_WORKSPACE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_WORKSPACE_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );
  const delegatedAdmin = process.env.GOOGLE_WORKSPACE_DELEGATED_ADMIN_EMAIL;

  if (!clientEmail || !privateKey || !delegatedAdmin) {
    throw new Error(
      "Missing GOOGLE_WORKSPACE_CLIENT_EMAIL, GOOGLE_WORKSPACE_PRIVATE_KEY, or GOOGLE_WORKSPACE_DELEGATED_ADMIN_EMAIL",
    );
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    subject: delegatedAdmin, // impersonate manny@pushingcap.com
  });
}

// ── Cached client ─────────────────────────────────────────────────────────

let _driveClient: ReturnType<typeof google.drive> | null = null;

function getDriveClient() {
  if (!_driveClient) {
    _driveClient = google.drive({ version: "v3", auth: getDriveAuth() });
  }
  return _driveClient;
}

// ── Public API ────────────────────────────────────────────────────────────

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

/**
 * Search the delegated user's Drive for credit report files.
 * Looks for PDFs & images with "credit", "experian", "equifax", or "transunion"
 * in the file name.
 */
export async function searchCreditReportFiles(): Promise<DriveFile[]> {
  const drive = getDriveClient();

  const queries = [
    'name contains "credit"',
    'name contains "Credit"',
    'name contains "Experian"',
    'name contains "experian"',
    'name contains "Equifax"',
    'name contains "equifax"',
    'name contains "TransUnion"',
    'name contains "transunion"',
    'name contains "FICO"',
    'name contains "fico"',
  ];

  // Combine with OR, filter to PDFs/images/docs
  const mimeFilter = [
    "mimeType = 'application/pdf'",
    "mimeType = 'image/png'",
    "mimeType = 'image/jpeg'",
    "mimeType = 'application/vnd.google-apps.document'",
  ].join(" or ");

  const nameFilter = queries.join(" or ");
  const fullQuery = `(${nameFilter}) and (${mimeFilter}) and trashed = false`;

  const res = await drive.files.list({
    q: fullQuery,
    pageSize: 50,
    fields:
      "files(id, name, mimeType, modifiedTime, size, webViewLink, thumbnailLink)",
    orderBy: "modifiedTime desc",
  });

  return (res.data.files || []) as DriveFile[];
}

/**
 * List ALL files in the user's Drive (for debugging/staging).
 * Returns the 30 most recently modified files.
 */
export async function listRecentFiles(): Promise<DriveFile[]> {
  const drive = getDriveClient();

  const res = await drive.files.list({
    pageSize: 30,
    fields:
      "files(id, name, mimeType, modifiedTime, size, webViewLink, thumbnailLink)",
    orderBy: "modifiedTime desc",
    q: "trashed = false",
  });

  return (res.data.files || []) as DriveFile[];
}

/**
 * Get file metadata by ID.
 */
export async function getFileMetadata(fileId: string): Promise<DriveFile> {
  const drive = getDriveClient();

  const res = await drive.files.get({
    fileId,
    fields: "id, name, mimeType, modifiedTime, size, webViewLink, thumbnailLink",
  });

  return res.data as DriveFile;
}

/**
 * Download a file's binary content from Drive.
 * Returns an ArrayBuffer of the file bytes.
 */
export async function downloadFile(fileId: string): Promise<{
  buffer: ArrayBuffer;
  mimeType: string;
  name: string;
}> {
  const drive = getDriveClient();

  // First get metadata
  const meta = await drive.files.get({
    fileId,
    fields: "name, mimeType",
  });

  const mimeType = meta.data.mimeType || "application/octet-stream";
  const name = meta.data.name || "file";

  // For Google Docs types, export as PDF
  if (mimeType.startsWith("application/vnd.google-apps.")) {
    const res = await drive.files.export(
      { fileId, mimeType: "application/pdf" },
      { responseType: "arraybuffer" },
    );
    return {
      buffer: res.data as ArrayBuffer,
      mimeType: "application/pdf",
      name: name.replace(/\.[^.]+$/, "") + ".pdf",
    };
  }

  // Regular files → download directly
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" },
  );

  return { buffer: res.data as ArrayBuffer, mimeType, name };
}

/**
 * Search for files in a specific folder.
 */
export async function listFilesInFolder(folderId: string): Promise<DriveFile[]> {
  const drive = getDriveClient();

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    pageSize: 100,
    fields:
      "files(id, name, mimeType, modifiedTime, size, webViewLink, thumbnailLink)",
    orderBy: "name",
  });

  return (res.data.files || []) as DriveFile[];
}
