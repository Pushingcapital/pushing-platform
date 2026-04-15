"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

type Step = "face" | "license" | "processing" | "confirm" | "ssn" | "verified";

type ParsedIdentity = {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  address?: string;
  expirationDate?: string;
  state?: string;
  status: string;
};

async function parseLicenseImage(file: File | Blob): Promise<ParsedIdentity> {
  const formData = new FormData();
  formData.set("file", file instanceof File ? file : new File([file], "license.jpg", { type: "image/jpeg" }));

  const response = await fetch("/api/document-ai/parse-license", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || !("licenseParse" in result)) {
    throw new Error(result.error ?? "Unable to parse the license.");
  }

  const lp = result.licenseParse;
  return {
    fullName: lp.fields?.fullName ?? undefined,
    firstName: lp.fields?.firstName ?? undefined,
    lastName: lp.fields?.lastName ?? undefined,
    licenseNumber: lp.fields?.licenseNumber ?? undefined,
    dateOfBirth: lp.fields?.dateOfBirth ?? undefined,
    address: lp.fields?.address ?? undefined,
    expirationDate: lp.fields?.expirationDate ?? undefined,
    state: lp.fields?.state ?? undefined,
    status: lp.status ?? "parsed",
  };
}

function collectDeviceFingerprint() {
  const nav = typeof navigator !== "undefined" ? navigator : null;
  return {
    userAgent: nav?.userAgent ?? "",
    platform: nav?.platform ?? "",
    language: nav?.language ?? "en-US",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "America/Los_Angeles",
    screenWidth: typeof screen !== "undefined" ? screen.width : 1920,
    screenHeight: typeof screen !== "undefined" ? screen.height : 1080,
    viewportWidth: typeof window !== "undefined" ? window.innerWidth : 1920,
    viewportHeight: typeof window !== "undefined" ? window.innerHeight : 1080,
    devicePixelRatio: typeof window !== "undefined" ? window.devicePixelRatio : 1,
  };
}

async function fireDispatchSignal(identity: ParsedIdentity, faceBlob: Blob | null) {
  try {
    await fetch("/api/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: `bio_${Date.now().toString(36)}`,
        fingerprint: collectDeviceFingerprint(),
        identity,
        hasFaceBiometric: !!faceBlob,
        actions: [{ type: "quickbooks-provision", priority: "queued" }],
      }),
    });
  } catch {
    // Silent
  }
}

// ── Styles ─────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  borderRadius: "1.5rem",
  border: "1px solid rgba(255,255,255,0.08)",
  backgroundColor: "rgba(10,15,26,0.85)",
  backdropFilter: "blur(24px)",
  padding: "2.5rem 2rem",
  maxWidth: "28rem",
  margin: "0 auto",
  boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
};

const heading: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "1.5rem",
};

const brand: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.7)",
  marginBottom: "0.5rem",
};

const h2Style: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 600,
  color: "#ffffff",
  letterSpacing: "-0.02em",
};

const subtext: React.CSSProperties = {
  marginTop: "0.75rem",
  fontSize: "13px",
  color: "rgba(255,255,255,0.4)",
  lineHeight: 1.6,
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  marginTop: "1rem",
  padding: "14px",
  borderRadius: "9999px",
  border: "none",
  backgroundColor: "#d4fff0",
  color: "#04111d",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  ...btnPrimary,
  backgroundColor: "rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(255,255,255,0.12)",
};

// ── Component ──────────────────────────────────────────────────────────────

export function OnboardingIntakeForm() {
  const [step, setStep] = useState<Step>("face");
  const [faceBlob, setFaceBlob] = useState<Blob | null>(null);
  const [faceCaptured, setFaceCaptured] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [identity, setIdentity] = useState<ParsedIdentity | null>(null);
  const [corrections, setCorrections] = useState<Record<string, string>>({});
  const [ssn, setSsn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  // Auto-redirect to vault after verification
  useEffect(() => {
    if (step === "verified" && identity) {
      const timer = setTimeout(() => {
        router.push(`/vault?user=${encodeURIComponent(identity.firstName ?? identity.fullName ?? "")}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, identity, router]);

  // ── Face capture ─────────────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreaming(true);
    } catch {
      setError("Camera access is required for identity verification.");
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setFaceBlob(blob);
          setFaceCaptured(true);
          // Stop camera
          streamRef.current?.getTracks().forEach((t) => t.stop());
          setStreaming(false);
        }
      },
      "image/jpeg",
      0.9,
    );
  }, []);

  const retakePhoto = useCallback(() => {
    setFaceBlob(null);
    setFaceCaptured(false);
    startCamera();
  }, [startCamera]);

  const proceedToLicense = useCallback(() => {
    setStep("license");
  }, []);

  // ── License parse ────────────────────────────────────────────────────────

  const handleLicenseUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setStep("processing");
      setError(null);

      try {
        // 1. Parse DL fields via Google Vision OCR
        const parsed = await parseLicenseImage(file);
        setIdentity(parsed);

        // 2. Face-match: compare selfie biometric to DL photo
        if (faceBlob) {
          const matchForm = new FormData();
          matchForm.set("selfie", new File([faceBlob], "selfie.jpg", { type: "image/jpeg" }));
          matchForm.set("license", file);

          const matchRes = await fetch("/api/document-ai/face-match", {
            method: "POST",
            body: matchForm,
          });
          const matchResult = await matchRes.json();

          if (matchResult.match === false && matchResult.reason) {
            throw new Error(matchResult.message || "Face verification failed. Please try again.");
          }
        }

        // 3. Go to confirm step — let user verify/correct parsed fields
        setStep("confirm");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to process the license.");
        setStep("license");
      }
    },
    [faceBlob],
  );

  // ── Confirm & finalize ───────────────────────────────────────────────────

  const confirmAndFinalize = useCallback(() => {
    if (!identity) return;

    // Merge corrections into identity
    const corrected: ParsedIdentity = {
      ...identity,
      ...(corrections.fullName && { fullName: corrections.fullName }),
      ...(corrections.firstName && { firstName: corrections.firstName }),
      ...(corrections.lastName && { lastName: corrections.lastName }),
      ...(corrections.address && { address: corrections.address }),
      ...(corrections.dateOfBirth && { dateOfBirth: corrections.dateOfBirth }),
      ...(corrections.licenseNumber && { licenseNumber: corrections.licenseNumber }),
      ...(corrections.state && { state: corrections.state }),
    };

    setIdentity(corrected);
    setStep("ssn");
  }, [identity, corrections]);

  // ── SSN finalize ────────────────────────────────────────────────────────

  const handleSsnSubmit = useCallback(() => {
    if (!identity) return;
    const cleaned = ssn.replace(/\D/g, "");
    if (cleaned.length !== 9) {
      setError("Please enter a valid 9-digit SSN.");
      return;
    }
    setError(null);
    fireDispatchSignal(identity, faceBlob);
    setStep("verified");
  }, [identity, ssn, faceBlob]);

  const formatSsnInput = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (step === "face") {
    return (
      <section style={card}>
        <div style={heading}>
          <p style={brand}>pushingSecurity</p>
          <h2 style={h2Style}>Identity Verification</h2>
          <p style={subtext}>
            Please record your face for secure biometric verification.
          </p>
        </div>

        {/* Camera viewport */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1",
            borderRadius: "1rem",
            overflow: "hidden",
            backgroundColor: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "1rem",
          }}
        >
          {faceCaptured && faceBlob ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={URL.createObjectURL(faceBlob)}
              alt="Face capture"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)",
                  display: streaming ? "block" : "none",
                }}
              />
              {!streaming && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{ fontSize: "48px", opacity: 0.3 }}>📷</div>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.2em" }}>
                    Camera preview
                  </p>
                </div>
              )}
            </>
          )}

          {/* Face guide overlay */}
          {streaming && !faceCaptured && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: "60%",
                  height: "75%",
                  borderRadius: "50%",
                  border: "2px dashed rgba(212,255,240,0.4)",
                }}
              />
            </div>
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.08)", color: "#fecaca", fontSize: "13px", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {!streaming && !faceCaptured && (
          <button onClick={startCamera} style={btnPrimary} type="button">
            Open Camera
          </button>
        )}

        {streaming && !faceCaptured && (
          <button onClick={capturePhoto} style={btnPrimary} type="button">
            Capture
          </button>
        )}

        {faceCaptured && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={retakePhoto} style={{ ...btnSecondary, flex: 1 }} type="button">
              Retake
            </button>
            <button onClick={proceedToLicense} style={{ ...btnPrimary, flex: 2 }} type="button">
              Continue
            </button>
          </div>
        )}
      </section>
    );
  }

  if (step === "license") {
    return (
      <section style={card}>
        <div style={heading}>
          <p style={brand}>pushingSecurity</p>
          <h2 style={h2Style}>Driver License</h2>
          <p style={subtext}>
            Upload a clear photo of your driver license. We'll verify your identity automatically.
          </p>
        </div>

        {/* Upload area */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "3rem 2rem",
            borderRadius: "1rem",
            border: "2px dashed rgba(255,255,255,0.12)",
            backgroundColor: "rgba(255,255,255,0.02)",
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}
        >
          <div style={{ fontSize: "48px", opacity: 0.4 }}>🪪</div>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
            Tap to upload or take a photo
          </p>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            JPG, PNG, or HEIC
          </p>
          <input
            accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={handleLicenseUpload}
            type="file"
            capture="environment"
            style={{ display: "none" }}
          />
        </label>

        {error && (
          <div style={{ marginTop: "1rem", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.08)", color: "#fecaca", fontSize: "13px" }}>
            {error}
          </div>
        )}
      </section>
    );
  }

  if (step === "processing") {
    return (
      <section style={card}>
        <div style={{ ...heading, marginBottom: 0 }}>
          <p style={brand}>pushingSecurity</p>
          <h2 style={h2Style}>Verifying…</h2>
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.1)",
                borderTopColor: "#d4fff0",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
          <p style={{ ...subtext, marginTop: "1.5rem" }}>
            Extracting identity from your documents…
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </section>
    );
  }

  if (step === "confirm" && identity) {
    // Fields to display — flag anything empty or missing as needing confirmation
    const fields: { key: string; label: string; value: string | undefined; alwaysEditable?: boolean }[] = [
      { key: "fullName", label: "Full Name", value: identity.fullName },
      { key: "firstName", label: "First Name", value: identity.firstName },
      { key: "lastName", label: "Last Name", value: identity.lastName },
      { key: "dateOfBirth", label: "Date of Birth", value: identity.dateOfBirth },
      { key: "licenseNumber", label: "License Number", value: identity.licenseNumber },
      { key: "state", label: "State", value: identity.state },
      { key: "address", label: "Address", value: identity.address, alwaysEditable: true },
      { key: "expirationDate", label: "Expiration", value: identity.expirationDate },
    ];

    // Only show fields that have a value OR need correction
    const needsAttention = fields.filter((f) => !f.value || f.alwaysEditable);
    const confirmed = fields.filter((f) => f.value && !f.alwaysEditable);

    const inputStyle: React.CSSProperties = {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid rgba(250,204,21,0.3)",
      backgroundColor: "rgba(250,204,21,0.06)",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
    };

    return (
      <section style={card}>
        <div style={heading}>
          <p style={brand}>pushingSecurity</p>
          <h2 style={h2Style}>Confirm Your Info</h2>
          <p style={subtext}>
            We extracted the following from your license. Please verify and correct anything that looks off.
          </p>
        </div>

        {/* Confirmed fields */}
        {confirmed.length > 0 && (
          <div style={{ display: "grid", gap: "6px", marginBottom: "16px" }}>
            {confirmed.map((f) => (
              <div
                key={f.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(52,211,153,0.15)",
                  backgroundColor: "rgba(52,211,153,0.04)",
                }}
              >
                <div>
                  <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                    {f.label}
                  </p>
                  <p style={{ marginTop: "2px", fontSize: "14px", color: "#fff" }}>
                    {f.value}
                  </p>
                </div>
                <span style={{ fontSize: "14px", color: "#34d399" }}>✓</span>
              </div>
            ))}
          </div>
        )}

        {/* Fields needing attention */}
        {needsAttention.length > 0 && (
          <div style={{ display: "grid", gap: "10px", marginBottom: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(250,204,21,0.7)" }}>
              {needsAttention.some((f) => !f.value) ? "Needs your input" : "Please confirm"}
            </p>
            {needsAttention.map((f) => (
              <label key={f.key} style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: "10px", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "4px" }}>
                  {f.label} {!f.value && <span style={{ color: "rgba(250,204,21,0.7)" }}>· missing</span>}
                </span>
                <input
                  defaultValue={f.value ?? ""}
                  onChange={(e) =>
                    setCorrections((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  placeholder={`Enter your ${f.label.toLowerCase()}`}
                  style={inputStyle}
                />
              </label>
            ))}
          </div>
        )}

        <button onClick={confirmAndFinalize} style={btnPrimary} type="button">
          Confirm & Continue
        </button>
      </section>
    );
  }

  if (step === "ssn") {
    return (
      <section style={card}>
        <div style={heading}>
          <p style={brand}>pushingSecurity</p>
          <h2 style={h2Style}>Social Security Number</h2>
          <p style={subtext}>
            We need your SSN to complete identity verification. You can upload a photo of your SSN card or type it below.
          </p>
        </div>

        {/* Upload SSN card */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "20px",
            borderRadius: "14px",
            border: "2px dashed rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.02)",
            cursor: "pointer",
            transition: "border-color 0.15s",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "28px" }}>📸</span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            Upload SSN card (optional)
          </span>
          <input
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              // Parse SSN card text via Vision API
              try {
                const form = new FormData();
                form.set("file", file);
                const res = await fetch("/api/document-ai/parse-license", {
                  method: "POST",
                  body: form,
                });
                const data = await res.json();
                // Try to extract SSN pattern from full text
                const text = JSON.stringify(data.licenseParse ?? {});
                const ssnMatch = text.match(/\b(\d{3})[- ]?(\d{2})[- ]?(\d{4})\b/);
                if (ssnMatch) {
                  setSsn(`${ssnMatch[1]}-${ssnMatch[2]}-${ssnMatch[3]}`);
                }
              } catch {
                // Fall through to manual entry
              }
            }}
            type="file"
            capture="environment"
            style={{ display: "none" }}
          />
        </label>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "8px 0 16px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            or type it
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Manual SSN input */}
        <input
          value={ssn}
          onChange={(e) => setSsn(formatSsnInput(e.target.value))}
          placeholder="XXX-XX-XXXX"
          maxLength={11}
          inputMode="numeric"
          autoComplete="off"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(255,255,255,0.04)",
            color: "#fff",
            fontSize: "20px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textAlign: "center",
            outline: "none",
            fontFamily: "monospace",
          }}
        />

        <p style={{ marginTop: "8px", fontSize: "11px", color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
          🔒 Encrypted · Never stored in plaintext
        </p>

        {error && (
          <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.08)", color: "#fecaca", fontSize: "13px" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSsnSubmit}
          style={{ ...btnPrimary, marginTop: "20px" }}
          type="button"
        >
          Secure & Continue
        </button>
      </section>
    );
  }

  // step === "verified"
  return (
    <section style={card}>
      <div style={{ ...heading, marginBottom: 0 }}>
        <p style={brand}>pushingSecurity</p>
        <h2 style={h2Style}>Verified</h2>

        <div
          style={{
            marginTop: "1.5rem",
            padding: "20px",
            borderRadius: "1rem",
            border: "1px solid rgba(52,211,153,0.2)",
            backgroundColor: "rgba(52,211,153,0.06)",
          }}
        >
          <p style={{ fontSize: "20px", fontWeight: 600, color: "#fff" }}>
            {identity?.fullName || `${identity?.firstName ?? ""} ${identity?.lastName ?? ""}`.trim() || "Identity confirmed"}
          </p>
          {identity?.licenseNumber && (
            <p style={{ marginTop: "6px", fontSize: "12px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
              License verified
            </p>
          )}
          {identity?.state && (
            <p style={{ marginTop: "4px", fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
              {identity.state}
            </p>
          )}
        </div>

        <p style={{ ...subtext, marginTop: "1.5rem" }}>
          Your identity has been verified. We'll be in touch shortly to complete your setup.
        </p>
      </div>
    </section>
  );
}
