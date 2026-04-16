import { NextResponse, NextRequest } from "next/server";
import { transcribeAudio } from "@/lib/google-speech";

/**
 * /api/debate-ingest — Speech Ingest → PushingDebate Studio
 *
 * POST: Accept audio (multipart/form-data or base64 JSON)
 *   → Transcribe via Google Cloud Speech-to-Text
 *   → Route transcription to /pushing-debate-studio.y Worker (pushingdebatedude)
 *   → Return Stitch confirmation
 *
 * This is the speech entry point for the PushingDebate Studio pipeline.
 * MemoryPC stores both the raw audio reference and the normalized transcription.
 */

const DEBATE_STUDIO_API =
  process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/pushing-debate-studio`
    : "https://pushingcap.com/api/pushing-debate-studio";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  let audioBytes: Buffer;
  let mimeType: string;
  let source = "voice";
  let sessionId = `voice_${Date.now()}`;
  let context = "";

  try {
    // ── Handle multipart/form-data (direct audio upload) ──
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const audioFile = formData.get("audio") as File | null;
      source = (formData.get("source") as string) || "voice";
      sessionId = (formData.get("session_id") as string) || sessionId;
      context = (formData.get("context") as string) || "";

      if (!audioFile) {
        return NextResponse.json(
          { error: "audio file required in form data" },
          { status: 400 },
        );
      }

      audioBytes = Buffer.from(await audioFile.arrayBuffer());
      mimeType = audioFile.type || "audio/webm";
    }
    // ── Handle JSON (base64 audio) ──
    else {
      const body = await req.json();
      const { audio_base64, mime_type, source: s, session_id: sid, context: ctx } = body;

      if (!audio_base64) {
        return NextResponse.json(
          {
            error: "audio_base64 required (base64-encoded audio bytes)",
            usage: {
              endpoint: "/api/debate-ingest",
              methods: ["multipart/form-data (audio field)", "JSON (audio_base64)"],
              supported_formats: ["audio/webm", "audio/ogg", "audio/mp3", "audio/wav", "audio/flac"],
              pipeline: "Speech → Transcribe → Normalize → Route → pushingdebatedude → MemoryPC",
            },
          },
          { status: 400 },
        );
      }

      audioBytes = Buffer.from(audio_base64, "base64");
      mimeType = mime_type || "audio/webm";
      if (s) source = s;
      if (sid) sessionId = sid;
      if (ctx) context = ctx;
    }

    // ── STAGE 1: TRANSCRIBE via Google Cloud Speech ──
    const speechResult = await transcribeAudio({
      audioBytes,
      mimeType,
    });

    if (speechResult.status === "failed" || !speechResult.fullText) {
      return NextResponse.json(
        {
          error: "Speech transcription failed",
          speech: speechResult,
          worker: "pushingdebatedude",
        },
        { status: 422 },
      );
    }

    // ── STAGE 2: ROUTE to PushingDebate Studio for Normalize + Stitch ──
    const debateResponse = await fetch(DEBATE_STUDIO_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: speechResult.fullText,
        source: `voice_${source}`,
        context: `[Speech confidence: ${speechResult.confidence}] ${context}`,
        session_id: sessionId,
      }),
    });

    const debateResult = await debateResponse.json();

    // ── COMBINED RESPONSE ──
    return NextResponse.json({
      success: true,
      pipeline: "SPEECH → TRANSCRIBE → NORMALIZE → VALIDATE → ROUTE → STORE → AUDIT → ACK",
      speech: {
        provider: speechResult.provider,
        status: speechResult.status,
        fullText: speechResult.fullText,
        confidence: speechResult.confidence,
        durationMs: speechResult.durationMs,
        wordCount: speechResult.transcriptions.reduce(
          (s, t) => s + t.words.length, 0,
        ),
      },
      debate: debateResult,
      worker: "pushingdebatedude",
      api: "/pushing-debate-studio.y",
      memoryPC: true,
      tag: "pushingcap",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Debate ingest failed", detail: e.message },
      { status: 500 },
    );
  }
}
