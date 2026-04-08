'use client';
import { useState } from 'react';
import Nav from '../components/Nav';

const FORM_TYPES = [
  {
    id: 'credit', emoji: '💳', name: 'Credit Application',
    tag: 'Finance', tagClass: 'tag-green', accent: 'var(--green)',
    desc: 'Full consumer credit intake — income, employer, SSN.',
    fields: ['SSN', 'Income', 'Employer', 'Housing'],
  },
  {
    id: 'vehicle', emoji: '🚗', name: 'Vehicle Purchase',
    tag: 'Automotive', tagClass: 'tag-cyan', accent: 'var(--cyan)',
    desc: 'Buyer info, desired vehicle, trade-in, financing prefs.',
    fields: ['Buyer', 'Vehicle', 'Trade-In', 'Finance'],
  },
  {
    id: 'service', emoji: '🔧', name: 'Service Request',
    tag: 'Operations', tagClass: 'tag-purple', accent: 'var(--purple)',
    desc: 'Client issue, urgency level, and scheduling.',
    fields: ['Client', 'Issue', 'Urgency', 'Schedule'],
  },
  {
    id: 'realestate', emoji: '🏠', name: 'Property Intake',
    tag: 'Real Estate', tagClass: 'tag-yellow', accent: 'var(--yellow)',
    desc: 'Buyer/seller property intake with budget and timeline.',
    fields: ['Budget', 'Location', 'Type', 'Timeline'],
  },
  {
    id: 'subcontractor', emoji: '👷', name: 'Subcontractor',
    tag: 'Operations', tagClass: 'tag-red', accent: 'var(--red)',
    desc: 'Contractor qualifications, trade, insurance, and rate.',
    fields: ['License', 'Trade', 'Insurance', 'Rate'],
  },
  {
    id: 'custom', emoji: '✨', name: 'Custom Request',
    tag: 'Custom', tagClass: 'tag-green', accent: 'var(--green)',
    desc: 'Any field, any logic. We build and deploy it.',
    fields: ['Any field', 'Any logic'],
  },
];

const FORM_FIELDS = {
  credit: (
    <>
      <div className="row2">
        <div className="field"><label className="label">First Name</label><input className="input" placeholder="First" /></div>
        <div className="field"><label className="label">Last Name</label><input className="input" placeholder="Last" /></div>
      </div>
      <div className="field"><label className="label">Date of Birth</label><input className="input" type="date" /></div>
      <div className="field"><label className="label">Social Security Number</label><input className="input" placeholder="XXX-XX-XXXX" maxLength={11} /></div>
      <div className="row2">
        <div className="field"><label className="label">Annual Income</label><input className="input" type="number" placeholder="$0" /></div>
        <div className="field"><label className="label">Employer</label><input className="input" placeholder="Company" /></div>
      </div>
      <div className="field">
        <label className="label">Housing Status</label>
        <select className="select"><option>Select...</option><option>Own</option><option>Rent</option><option>Other</option></select>
      </div>
    </>
  ),
  vehicle: (
    <>
      <div className="row2">
        <div className="field"><label className="label">Full Name</label><input className="input" placeholder="Full name" /></div>
        <div className="field"><label className="label">Phone</label><input className="input" type="tel" placeholder="(555) 000-0000" /></div>
      </div>
      <div className="field"><label className="label">Email</label><input className="input" type="email" placeholder="you@email.com" /></div>
      <div className="row2">
        <div className="field"><label className="label">Desired Make</label><input className="input" placeholder="e.g. Toyota" /></div>
        <div className="field"><label className="label">Desired Model</label><input className="input" placeholder="e.g. Camry" /></div>
      </div>
      <div className="row2">
        <div className="field"><label className="label">Max Budget</label><input className="input" type="number" placeholder="$0" /></div>
        <div className="field">
          <label className="label">Financing?</label>
          <select className="select"><option>Select...</option><option>Yes — need financing</option><option>No — cash</option></select>
        </div>
      </div>
      <div className="field"><label className="label">Trade-in?</label><input className="input" placeholder="Year, Make, Model or N/A" /></div>
    </>
  ),
  service: (
    <>
      <div className="row2">
        <div className="field"><label className="label">Name</label><input className="input" placeholder="Your name" /></div>
        <div className="field"><label className="label">Phone</label><input className="input" type="tel" placeholder="(555) 000-0000" /></div>
      </div>
      <div className="field">
        <label className="label">Service Type</label>
        <select className="select"><option>Select...</option><option>Repair</option><option>Installation</option><option>Inspection</option><option>Consultation</option></select>
      </div>
      <div className="field">
        <label className="label">Urgency</label>
        <select className="select"><option>Select...</option><option>🔴 Emergency (today)</option><option>🟠 Urgent (this week)</option><option>🟡 Standard</option></select>
      </div>
      <div className="field"><label className="label">Description</label><textarea className="textarea" placeholder="Describe the issue..." /></div>
    </>
  ),
  realestate: (
    <>
      <div className="row2">
        <div className="field"><label className="label">Name</label><input className="input" placeholder="Full name" /></div>
        <div className="field"><label className="label">Phone</label><input className="input" type="tel" placeholder="(555) 000-0000" /></div>
      </div>
      <div className="field">
        <label className="label">I am a...</label>
        <select className="select"><option>Select...</option><option>Buyer</option><option>Seller</option><option>Investor</option></select>
      </div>
      <div className="row2">
        <div className="field"><label className="label">Budget</label><input className="input" placeholder="$0 – $0" /></div>
        <div className="field"><label className="label">Target Area</label><input className="input" placeholder="City or ZIP" /></div>
      </div>
      <div className="field">
        <label className="label">Property Type</label>
        <select className="select"><option>Select...</option><option>Single Family</option><option>Multi-Family</option><option>Commercial</option><option>Land</option></select>
      </div>
    </>
  ),
  subcontractor: (
    <>
      <div className="row2">
        <div className="field"><label className="label">Full Name</label><input className="input" placeholder="Full name" /></div>
        <div className="field"><label className="label">Company</label><input className="input" placeholder="Business name" /></div>
      </div>
      <div className="field">
        <label className="label">Trade / Specialty</label>
        <select className="select"><option>Select...</option><option>Auto Repair</option><option>Electrical</option><option>HVAC</option><option>Plumbing</option><option>General Contractor</option><option>Other</option></select>
      </div>
      <div className="row2">
        <div className="field"><label className="label">License #</label><input className="input" placeholder="State license" /></div>
        <div className="field"><label className="label">Hourly Rate</label><input className="input" type="number" placeholder="$0/hr" /></div>
      </div>
      <div className="field"><label className="label">Service Area</label><input className="input" placeholder="City, state or radius" /></div>
    </>
  ),
  custom: (
    <>
      <div className="row2">
        <div className="field"><label className="label">Your Name</label><input className="input" placeholder="Name" /></div>
        <div className="field"><label className="label">Email</label><input className="input" type="email" placeholder="you@email.com" /></div>
      </div>
      <div className="field"><label className="label">Business / Department</label><input className="input" placeholder="Company or team" /></div>
      <div className="field"><label className="label">Form description</label><textarea className="textarea" placeholder="What data do you need to collect?" /></div>
      <div className="field">
        <label className="label">CRM integration?</label>
        <select className="select"><option>Select...</option><option>Yes — sync to PCRM</option><option>Yes — email only</option><option>No — standalone</option></select>
      </div>
    </>
  ),
};

export default function FormsPage() {
  const [active, setActive] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [ref, setRef] = useState('');

  const openForm = (id) => { setActive(id); setSubmitted(false); };
  const closeForm = () => setActive(null);
  const submit = () => {
    const f = FORM_TYPES.find(f => f.id === active);
    setRef('PF-' + f.id.slice(0, 3).toUpperCase() + '-' + Date.now().toString(36).toUpperCase());
    setSubmitted(true);
  };

  const activeForm = FORM_TYPES.find(f => f.id === active);

  return (
    <>
      <Nav logo="PushingForms" accent="var(--forms-accent)" cta={{ href: '#forms', label: 'Browse Forms' }} />
      <main className="page">
        {/* Hero */}
        <section className="hero" style={{ paddingTop: '3rem' }}>
          <div className="hero-eyebrow" style={{
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: 'var(--cyan)',
          }}>📋 Intake Infrastructure</div>
          <h1>Forms that<br /><span style={{ color: 'var(--forms-accent)' }}>close deals.</span></h1>
          <p>Pre-built, GLBA-compliant intake forms for auto, finance, and real estate — synced live to your CRM.</p>
          <div className="btn-row">
            <a href="#forms" className="btn btn-lg btn-primary" style={{ background: 'var(--cyan)', color: '#000' }}>
              Browse Forms →
            </a>
            <button className="btn btn-lg btn-ghost" onClick={() => openForm('custom')}>
              Request Custom
            </button>
          </div>
        </section>

        {/* Stats */}
        <div className="stats">
          {[
            { val: '6', label: 'Form Types' },
            { val: '7,294', label: 'PCRM Records' },
            { val: 'CRM', label: 'Auto-Synced' },
            { val: 'GLBA', label: 'Compliant' },
          ].map(s => (
            <div key={s.label} className="stat-item">
              <div className="stat-val" style={{ color: 'var(--cyan)', fontSize: '1.5rem' }}>{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Form grid */}
        <section id="forms" style={{ padding: '3rem 0 4rem' }}>
          <div className="container">
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '0.75rem' }}>Ready to deploy</p>
            <h2 style={{ marginBottom: '0.5rem' }}>Choose your form type</h2>
            <p style={{ fontSize: '0.88rem', marginBottom: '2rem' }}>Tap any form to launch and submit a test intake.</p>
            <div className="grid-3">
              {FORM_TYPES.map(f => (
                <div
                  key={f.id}
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => openForm(f.id)}
                >
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{f.emoji}</div>
                  <span className={`tag ${f.tagClass}`} style={{ marginBottom: '0.6rem' }}>{f.tag}</span>
                  <h3 style={{ color: f.accent, fontSize: '1rem', margin: '0.5rem 0 0.4rem' }}>{f.name}</h3>
                  <p style={{ fontSize: '0.78rem', marginBottom: '1rem' }}>{f.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {f.fields.map(field => (
                      <span key={field} style={{
                        fontSize: '0.62rem', padding: '0.15rem 0.45rem',
                        background: 'var(--surface2)', border: '1px solid var(--border)',
                        borderRadius: 4, color: 'var(--muted2)',
                      }}>{field}</span>
                    ))}
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: f.accent, fontWeight: 700 }}>
                    Open Form →
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modal / Bottom sheet */}
        <div
          className={`overlay${active ? ' open' : ''}`}
          onClick={e => e.target === e.currentTarget && closeForm()}
        >
          <div className="modal">
            {/* Drag handle (mobile) */}
            <div style={{ width: 40, height: 4, background: 'var(--border2)', borderRadius: 2, margin: '0 auto 1.25rem' }} />

            <button
              onClick={closeForm}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                width: 28, height: 28, borderRadius: '50%',
                border: '1px solid var(--border2)', background: 'var(--surface2)',
                color: 'var(--muted2)', cursor: 'pointer', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>

            {!submitted ? (
              <>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>{activeForm?.emoji}</div>
                <h3 style={{ marginBottom: '0.3rem' }}>{activeForm?.name}</h3>
                <p style={{ fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                  Submit your intake below. Data syncs to PCRM on submission.
                </p>
                {active && FORM_FIELDS[active]}
                <button
                  className="btn btn-lg btn-primary"
                  style={{ background: 'var(--cyan)', color: '#000', width: '100%', marginTop: '1.25rem' }}
                  onClick={submit}
                >
                  Submit to PCRM →
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✓</div>
                <h3 style={{ marginBottom: '0.4rem' }}>Submitted to PCRM</h3>
                <p style={{ fontSize: '0.82rem' }}>Your intake has been routed. A rep will follow up within 24 hours.</p>
                <div style={{
                  display: 'inline-block', marginTop: '0.9rem', padding: '0.3rem 0.9rem',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 6, fontFamily: 'monospace', fontSize: '0.72rem',
                  color: 'var(--cyan)', letterSpacing: '0.1em',
                }}>{ref}</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
