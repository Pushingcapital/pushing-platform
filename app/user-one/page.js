'use client';
import { useState } from 'react';
import Nav from '../components/Nav';

const ROLES = [
  { id: 'owner',   icon: '👑', name: 'Owner / Principal',    desc: 'Full access, billing, all modules' },
  { id: 'ops',     icon: '⚙️', name: 'Operations Lead',      desc: 'CRM, deals, tasks, reports' },
  { id: 'finance', icon: '💰', name: 'Finance / Compliance', desc: 'Invoices, credit, audits' },
  { id: 'agent',   icon: '🤖', name: 'Agent Operator',       desc: 'P-Agent control, BQ access' },
];

export default function UserOnePage() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('owner');
  const [done, setDone] = useState(false);
  const [uid, setUid] = useState('');

  const activate = () => {
    setUid('U1-' + Date.now().toString(36).toUpperCase());
    setDone(true);
  };

  return (
    <>
      <Nav logo="UserOne" accent="var(--userone-accent)" cta={{ href: '#setup', label: 'Set Up Profile' }} />
      <main className="page">
        <section className="hero" style={{ paddingTop: '3rem' }}>
          <div className="hero-eyebrow" style={{
            background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.25)', color: 'var(--purple)',
          }}>⬡ First User Setup</div>
          <h1>One profile.<br /><span style={{ color: 'var(--userone-accent)' }}>Full platform access.</span></h1>
          <p>UserOne is your verified operator identity — one account across Security, Forms, CRM, and Finance.</p>
        </section>

        <section id="setup" style={{ padding: '0 0 4rem' }}>
          <div className="container" style={{ maxWidth: 560 }}>
            <div className="card" style={{ border: '1px solid rgba(123,97,255,0.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg,transparent,var(--purple),var(--cyan),transparent)',
              }} />

              {!done ? (
                <>
                  {/* Step dots */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    {['Identity', 'Role', 'Verify'].map((s, i) => (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: i < 2 ? 1 : 'none' }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 700,
                          background: i < step ? 'rgba(123,97,255,0.2)' : i === step ? 'var(--purple)' : 'var(--surface)',
                          color: i === step ? '#fff' : i < step ? 'var(--purple)' : 'var(--muted)',
                          border: i < step ? '1px solid var(--purple)' : 'none',
                        }}>{i < step ? '✓' : i + 1}</div>
                        <span style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s}</span>
                        {i < 2 && <div style={{ flex: 1, height: 1, background: i < step ? 'var(--purple)' : 'var(--border)' }} />}
                      </div>
                    ))}
                  </div>

                  {step === 0 && (
                    <>
                      <h3 style={{ marginBottom: '0.3rem' }}>Who are you?</h3>
                      <p style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>This becomes your verified operator profile.</p>
                      <div className="row2">
                        <div className="field"><label className="label">First Name</label><input className="input" placeholder="Emmanuel" /></div>
                        <div className="field"><label className="label">Last Name</label><input className="input" placeholder="Haddad" /></div>
                      </div>
                      <div className="field"><label className="label">Business Email</label><input className="input" type="email" placeholder="you@yourbusiness.com" /></div>
                      <div className="field"><label className="label">Mobile (2FA)</label><input className="input" type="tel" placeholder="(555) 000-0000" /></div>
                      <div className="field">
                        <label className="label">Organization</label>
                        <select className="select">
                          <option>Select your entity</option>
                          <option>Pushing Capital, LLC</option>
                          <option>PushingSecurity</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <h3 style={{ marginBottom: '0.3rem' }}>What's your role?</h3>
                      <p style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>Sets your default access level and dashboard view.</p>
                      <div className="grid-2">
                        {ROLES.map(r => (
                          <div
                            key={r.id}
                            onClick={() => setRole(r.id)}
                            className="card"
                            style={{
                              cursor: 'pointer', padding: '1rem',
                              border: role === r.id ? '1px solid var(--purple)' : '1px solid var(--border)',
                              background: role === r.id ? 'rgba(123,97,255,0.08)' : 'var(--bg3)',
                              boxShadow: role === r.id ? '0 0 20px rgba(123,97,255,0.1)' : 'none',
                              transform: 'none',
                            }}
                          >
                            <div style={{ fontSize: '1.3rem', marginBottom: '0.35rem' }}>{r.icon}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{r.name}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--muted2)', marginTop: '0.2rem' }}>{r.desc}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h3 style={{ marginBottom: '0.3rem' }}>Almost there</h3>
                      <p style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>Confirm your setup before activating.</p>
                      {[
                        { icon: '🪪', label: 'Identity', status: 'READY', cls: 'tag-green' },
                        { icon: '🔐', label: '2FA via SMS', status: 'PENDING', cls: 'tag-yellow' },
                        { icon: '🛡', label: 'PushingSecurity Link', status: 'ACTIVE', cls: 'tag-green' },
                        { icon: '📋', label: 'PushingForms Access', status: 'GRANTED', cls: 'tag-green' },
                        { icon: ROLES.find(r => r.id === role)?.icon, label: `Role: ${ROLES.find(r => r.id === role)?.name}`, status: 'SET', cls: 'tag-purple' },
                      ].map(item => (
                        <div key={item.label} style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.75rem', background: 'var(--surface)',
                          border: '1px solid var(--border)', borderRadius: 10, marginBottom: '0.6rem',
                        }}>
                          <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                          <span style={{ fontSize: '0.8rem', flex: 1 }}>{item.label}</span>
                          <span className={`tag ${item.cls}`}>{item.status}</span>
                        </div>
                      ))}
                    </>
                  )}

                  <button
                    className="btn btn-lg btn-primary"
                    style={{ background: 'var(--purple)', color: '#fff', width: '100%', marginTop: '1.5rem' }}
                    onClick={step < 2 ? () => setStep(s => s + 1) : activate}
                  >
                    {step < 2 ? 'Continue →' : 'Activate UserOne →'}
                  </button>
                  {step > 0 && (
                    <button
                      style={{
                        width: '100%', marginTop: '0.6rem', padding: '0.5rem',
                        background: 'none', border: '1px solid var(--border)',
                        borderRadius: 8, color: 'var(--muted)', fontSize: '0.78rem',
                        fontFamily: 'inherit', cursor: 'pointer',
                      }}
                      onClick={() => setStep(s => s - 1)}
                    >← Back</button>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%', margin: '0 auto 1.25rem',
                    background: 'rgba(123,97,255,0.12)', border: '2px solid var(--purple)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem',
                    boxShadow: '0 0 40px rgba(123,97,255,0.25)',
                  }}>⬡</div>
                  <h3 style={{ marginBottom: '0.4rem' }}>UserOne Activated</h3>
                  <p style={{ fontSize: '0.85rem' }}>Your operator profile is live across the platform.</p>
                  <div style={{
                    display: 'inline-block', marginTop: '1rem', padding: '0.3rem 1rem',
                    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
                    fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--purple)', letterSpacing: '0.1em',
                  }}>{uid}</div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
