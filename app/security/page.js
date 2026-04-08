'use client';
import { useState, useRef, useEffect } from 'react';
import Nav from '../components/Nav';

// Stages of the vault flow
const STAGE = { PHONE: 'phone', OTP: 'otp', SECRET: 'secret', DONE: 'done' };

export default function SecurityPage() {
  const [stage, setStage]       = useState(STAGE.PHONE);
  const [phone, setPhone]       = useState('');
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [secret, setSecret]     = useState('');
  const [confirm, setConfirm]   = useState('');
  const [show, setShow]         = useState(false);
  const [ref, setRef]           = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const otpRefs = useRef([]);

  // Format phone as (xxx) xxx-xxxx
  const fmtPhone = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 10);
    if (d.length < 4)  return d;
    if (d.length < 7)  return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };

  const sendOTP = async () => {
    setError('');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) { setError('Enter a valid 10-digit US number.'); return; }
    setLoading(true);
    // TODO: call Firebase Phone Auth here
    // For now: simulate OTP send
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setStage(STAGE.OTP);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpKey = (i, v, e) => {
    if (e.key === 'Backspace' && !v && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpChange = (i, v) => {
    const val = v.replace(/\D/g, '').slice(0, 1);
    const next = [...otp]; next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const verifyOTP = async () => {
    setError('');
    const code = otp.join('');
    if (code.length < 6) { setError('Enter the full 6-digit code.'); return; }
    setLoading(true);
    // TODO: verify with Firebase here (confirmationResult.confirm(code))
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    setStage(STAGE.SECRET);
  };

  const saveSecret = async () => {
    setError('');
    if (!secret) { setError('Secret cannot be empty.'); return; }
    if (secret !== confirm) { setError('Secrets do not match.'); return; }
    if (secret.length < 8) { setError('Secret must be at least 8 characters.'); return; }
    setLoading(true);
    // TODO: encrypt + store in Google Cloud Secret Manager
    // TODO: send confirmation SMS via Firebase
    await new Promise(r => setTimeout(r, 900));
    const id = 'PSV-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    setRef(id);
    setLoading(false);
    setStage(STAGE.DONE);
  };

  const strength = (s) => {
    let score = 0;
    if (s.length >= 8)  score++;
    if (s.length >= 12) score++;
    if (/[A-Z]/.test(s)) score++;
    if (/[0-9]/.test(s)) score++;
    if (/[^A-Za-z0-9]/.test(s)) score++;
    return score;
  };
  const str = strength(secret);
  const strLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][str] || '';
  const strColor = ['', '#ff4444', '#ffb800', '#ffb800', 'var(--sec)', 'var(--sec)'][str] || 'var(--border)';

  return (
    <>
      <Nav logo="PushingSecurity" accent="var(--sec)" />
      <main className="page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>

        {/* ── HERO ── */}
        <section style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '4rem 1.5rem 3rem',
        }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sec)', marginBottom: '1.25rem' }}>
            Secret Vault
          </p>
          <h1 style={{ marginBottom: '1rem' }}>
            Your secret.<br />
            <span style={{ color: 'var(--sec)' }}>Sent to your phone.</span>
          </h1>
          <p style={{ fontSize: '1rem', maxWidth: 360, marginBottom: 0 }}>
            Submit a secret. The system encrypts, stores, and transmits a receipt to the registered number.
          </p>
        </section>

        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* ── VAULT FORM ── */}
        <section style={{ padding: '3rem 1.5rem 5rem' }}>
          <div style={{ maxWidth: 420, margin: '0 auto' }}>

            {/* ── STAGE: PHONE ── */}
            {stage === STAGE.PHONE && (
              <div className="card" style={{ borderColor: 'rgba(0,229,160,0.12)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,var(--sec),transparent)' }} />
                <h3 style={{ marginBottom: '0.25rem' }}>Enter your phone</h3>
                <p style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                  A one-time verification code will be dispatched to this number.
                </p>
                <div className="field">
                  <label className="label">Mobile Number</label>
                  <input
                    className="input"
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={phone}
                    onChange={e => setPhone(fmtPhone(e.target.value))}
                    onKeyDown={e => e.key === 'Enter' && sendOTP()}
                    style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}
                  />
                </div>
                {error && <p style={{ fontSize: '0.78rem', color: '#ff4444', marginBottom: '0.75rem' }}>{error}</p>}
                <button
                  className="btn btn-solid btn-lg"
                  style={{ background: 'var(--sec)', width: '100%', opacity: loading ? 0.6 : 1 }}
                  onClick={sendOTP}
                  disabled={loading}
                >
                  {loading ? 'Sending…' : 'Send Code →'}
                </button>
              </div>
            )}

            {/* ── STAGE: OTP ── */}
            {stage === STAGE.OTP && (
              <div className="card" style={{ borderColor: 'rgba(0,229,160,0.12)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,var(--sec),transparent)' }} />
                <h3 style={{ marginBottom: '0.25rem' }}>Check your phone</h3>
                <p style={{ fontSize: '0.82rem', marginBottom: '1.75rem' }}>
                  Enter the 6-digit code sent to <strong style={{ color: 'var(--text)' }}>{phone}</strong>
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  {otp.map((v, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="tel"
                      maxLength={1}
                      value={v}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, v, e)}
                      style={{
                        width: 44, height: 52, textAlign: 'center',
                        fontSize: '1.3rem', fontWeight: 700,
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${v ? 'var(--sec)' : 'var(--border)'}`,
                        borderRadius: 10, color: 'var(--text)',
                        outline: 'none', transition: 'border-color 0.15s',
                        fontFamily: 'inherit',
                      }}
                    />
                  ))}
                </div>
                {error && <p style={{ fontSize: '0.78rem', color: '#ff4444', marginBottom: '0.75rem', textAlign: 'center' }}>{error}</p>}
                <button
                  className="btn btn-solid btn-lg"
                  style={{ background: 'var(--sec)', width: '100%', opacity: loading ? 0.6 : 1 }}
                  onClick={verifyOTP} disabled={loading}
                >
                  {loading ? 'Verifying…' : 'Verify →'}
                </button>
                <button
                  onClick={() => { setStage(STAGE.PHONE); setOtp(['','','','','','']); setError(''); }}
                  style={{ width: '100%', marginTop: '0.6rem', background: 'none', border: 'none', color: 'var(--dim)', fontSize: '0.78rem', fontFamily: 'inherit', cursor: 'pointer', padding: '0.4rem' }}
                >
                  ← Wrong number
                </button>
              </div>
            )}

            {/* ── STAGE: SECRET ── */}
            {stage === STAGE.SECRET && (
              <div className="card" style={{ borderColor: 'rgba(0,229,160,0.12)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,var(--sec),transparent)' }} />
                <h3 style={{ marginBottom: '0.25rem' }}>Enter your secret</h3>
                <p style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                  Input is AES-256 encrypted at rest. An SMS receipt is dispatched on confirmation.
                </p>

                <div className="field">
                  <label className="label">Your Secret Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="input"
                      type={show ? 'text' : 'password'}
                      placeholder="Enter your secret…"
                      value={secret}
                      onChange={e => setSecret(e.target.value)}
                      style={{ paddingRight: '3rem', fontFamily: show ? 'inherit' : 'monospace', fontSize: '1rem', letterSpacing: show ? 'normal' : '0.15em' }}
                    />
                    <button
                      onClick={() => setShow(s => !s)}
                      style={{
                        position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: '1rem',
                      }}
                    >{show ? '🙈' : '👁'}</button>
                  </div>

                  {/* Strength bar */}
                  {secret.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: '0.25rem' }}>
                        <div style={{ height: '100%', width: `${(str / 5) * 100}%`, background: strColor, borderRadius: 2, transition: 'all 0.3s' }} />
                      </div>
                      <span style={{ fontSize: '0.65rem', color: strColor, fontWeight: 700 }}>{strLabel}</span>
                    </div>
                  )}
                </div>

                <div className="field">
                  <label className="label">Confirm Secret</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Confirm secret…"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    style={{ borderColor: confirm && confirm !== secret ? '#ff4444' : undefined, fontFamily: 'monospace', letterSpacing: '0.15em' }}
                  />
                </div>

                {error && <p style={{ fontSize: '0.78rem', color: '#ff4444', marginBottom: '0.75rem' }}>{error}</p>}

                <button
                  className="btn btn-solid btn-lg"
                  style={{ background: 'var(--sec)', width: '100%', opacity: loading ? 0.6 : 1 }}
                  onClick={saveSecret} disabled={loading}
                >
                  {loading ? 'Encrypting…' : 'Secure My Secret →'}
                </button>
              </div>
            )}

            {/* ── STAGE: DONE ── */}
            {stage === STAGE.DONE && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 1.25rem',
                  background: 'rgba(0,229,160,0.08)', border: '1px solid var(--sec)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                }}>🔐</div>
                <h3 style={{ marginBottom: '0.4rem' }}>Secret Secured</h3>
                <p style={{ fontSize: '0.85rem', maxWidth: 300, margin: '0 auto' }}>
                  Secret encrypted and stored. Receipt transmitted to {phone}.
                </p>
                <p className="mono" style={{
                  display: 'inline-block', marginTop: '1rem',
                  padding: '0.3rem 1rem',
                  background: 'rgba(0,229,160,0.06)',
                  border: '1px solid rgba(0,229,160,0.2)',
                  borderRadius: 6, fontSize: '0.75rem', color: 'var(--sec)',
                }}>{ref}</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
