import "server-only";

import { google } from "googleapis";

// ── Auth ──────────────────────────────────────────────────────────────────
// Uses the same Workspace service account with cloud-platform scope
// to call Cloud Speech-to-Text v2 on project brain-481809.
// ──────────────────────────────────────────────────────────────────────────

function getSpeechAuth() {
  const clientEmail = process.env.GOOGLE_WORKSPACE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_WORKSPACE_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing GOOGLE_WORKSPACE_CLIENT_EMAIL or GOOGLE_WORKSPACE_PRIVATE_KEY for Speech-to-Text",
    );
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
}

// ── Types ─────────────────────────────────────────────────────────────────

export interface SpeechTranscription {
  transcript: string;
  confidence: number;
  words: Array<{
    word: string;
    startTime: string;
    endTime: string;
    confidence: number;
  }>;
  languageCode: string;
}

export interface SpeechResult {
  provider: "google-speech-v2";
  status: "transcribed" | "failed";
  transcriptions: SpeechTranscription[];
  fullText: string;
  confidence: number | null;
  durationMs: number;
  warnings: string[];
  transcribedAt: string;
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Transcribe audio bytes using Google Cloud Speech-to-Text v2.
 * Accepts: audio/webm, audio/ogg, audio/mp3, audio/wav, audio/flac, audio/m4a
 *
 * Returns structured transcription with word-level timestamps and confidence.
 */
export async function transcribeAudio(input: {
  audioBytes: Buffer;
  mimeType: string;
  languageCode?: string;
  model?: string;
}): Promise<SpeechResult> {
  const startTime = Date.now();
  const projectId = process.env.GOOGLE_VISION_PROJECT_ID || "brain-481809";
  const auth = getSpeechAuth();
  const transcribedAt = new Date().toISOString();

  try {
    const accessTokenResponse = await auth.getAccessToken();
    const token =
      typeof accessTokenResponse === "string"
        ? accessTokenResponse
        : accessTokenResponse?.token;

    if (!token) {
      return {
        provider: "google-speech-v2",
        status: "failed",
        transcriptions: [],
        fullText: "",
        confidence: null,
        durationMs: Date.now() - startTime,
        warnings: ["Failed to obtain Google Cloud access token"],
        transcribedAt,
      };
    }

    // Map MIME types to Speech API encoding
    const encodingMap: Record<string, string> = {
      "audio/webm": "WEBM_OPUS",
      "audio/ogg": "OGG_OPUS",
      "audio/mp3": "MP3",
      "audio/mpeg": "MP3",
      "audio/wav": "LINEAR16",
      "audio/x-wav": "LINEAR16",
      "audio/flac": "FLAC",
      "audio/x-flac": "FLAC",
      "audio/m4a": "MP3", // fallback
      "audio/mp4": "MP3", // fallback
    };

    const encoding = encodingMap[input.mimeType] || "AUTO";
    const languageCode = input.languageCode || "en-US";

    // Use Speech v1 REST API (v2 requires recognizer setup)
    const endpoint = `https://speech.googleapis.com/v1/speech:recognize`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        config: {
          encoding: encoding === "AUTO" ? undefined : encoding,
          languageCode,
          model: input.model || "latest_long",
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: true,
          enableWordConfidence: true,
          maxAlternatives: 1,
          // Boost platform terms
          speechContexts: [
            {
              phrases: [
                "Pushing Capital",
                "pushingSecurity",
                "PushingDebate Studio",
                "pushingdebatedude",
                "MemoryPC",
                "Antigravity",
                "Vertex Router",
                "BigQuery",
                "Cloudflare",
                "RunPod",
                "PushingForms",
                "PushingPay",
                "PushingMail",
                "Golden Record",
                "Launchpad",
                "Stitch",
                "Worker",
                "Route",
                "API",
                "Ingest",
                "Normalize",
              ],
              boost: 15.0,
            },
          ],
        },
        audio: {
          content: input.audioBytes.toString("base64"),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        provider: "google-speech-v2",
        status: "failed",
        transcriptions: [],
        fullText: "",
        confidence: null,
        durationMs: Date.now() - startTime,
        warnings: [`Speech API error (${response.status}): ${errorText.slice(0, 200)}`],
        transcribedAt,
      };
    }

    const result = (await response.json()) as {
      results?: Array<{
        alternatives?: Array<{
          transcript?: string;
          confidence?: number;
          words?: Array<{
            word?: string;
            startTime?: string;
            endTime?: string;
            confidence?: number;
          }>;
        }>;
        languageCode?: string;
      }>;
    };

    const transcriptions: SpeechTranscription[] = [];
    const textParts: string[] = [];

    for (const res of result.results || []) {
      const alt = res.alternatives?.[0];
      if (!alt?.transcript) continue;

      textParts.push(alt.transcript);
      transcriptions.push({
        transcript: alt.transcript,
        confidence: alt.confidence || 0,
        words: (alt.words || []).map((w) => ({
          word: w.word || "",
          startTime: w.startTime || "0s",
          endTime: w.endTime || "0s",
          confidence: w.confidence || 0,
        })),
        languageCode: res.languageCode || languageCode,
      });
    }

    const fullText = textParts.join(" ");
    const avgConfidence =
      transcriptions.length > 0
        ? Math.round(
            (transcriptions.reduce((s, t) => s + t.confidence, 0) /
              transcriptions.length) *
              1000,
          ) / 1000
        : null;

    return {
      provider: "google-speech-v2",
      status: transcriptions.length > 0 ? "transcribed" : "failed",
      transcriptions,
      fullText,
      confidence: avgConfidence,
      durationMs: Date.now() - startTime,
      warnings:
        transcriptions.length === 0
          ? ["No transcription results returned"]
          : [],
      transcribedAt,
    };
  } catch (err) {
    return {
      provider: "google-speech-v2",
      status: "failed",
      transcriptions: [],
      fullText: "",
      confidence: null,
      durationMs: Date.now() - startTime,
      warnings: [
        `Speech-to-Text error: ${err instanceof Error ? err.message : String(err)}`,
      ],
      transcribedAt,
    };
  }
}

/**
 * Transcribe audio from a URL (fetches then processes).
 */
export async function transcribeFromUrl(
  audioUrl: string,
  mimeType?: string,
): Promise<SpeechResult> {
  const response = await fetch(audioUrl);
  if (!response.ok) {
    return {
      provider: "google-speech-v2",
      status: "failed",
      transcriptions: [],
      fullText: "",
      confidence: null,
      durationMs: 0,
      warnings: [`Failed to fetch audio from URL: ${response.status}`],
      transcribedAt: new Date().toISOString(),
    };
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const detectedMime =
    mimeType || response.headers.get("content-type") || "audio/webm";

  return transcribeAudio({
    audioBytes: buffer,
    mimeType: detectedMime,
  });
}
