import Link from 'next/link';
import Nav from './components/Nav';

export const metadata = { title: 'Pushing Platform' };

const PRODUCTS = [
  {
    href: '/security',
    emoji: '🛡',
    name: 'PushingSecurity',
    tag: 'Protection Layer',
    desc: 'Client onboarding, threat detection, and security intake — front door for every new relationship.',
    accent: 'var(--security-accent)',
    tagClass: 'tag-green',
  },
  {
    href: '/user-one',
    emoji: '⬡',
    name: 'UserOne',
    tag: 'Operator Identity',
    desc: 'One verified profile gives you full access to CRM, security, forms, and finance across the platform.',
    accent: 'var(--userone-accent)',
    tagClass: 'tag-purple',
  },
  {
    href: '/forms',
    emoji: '📋',
    name: 'PushingForms',
    tag: 'Intake Infrastructure',
    desc: 'Pre-built, compliant intake forms for auto, finance, and real estate — synced live to your CRM.',
    accent: 'var(--forms-accent)',
    tagClass: 'tag-cyan',
  },
];

export default function Home() {
  return (
    <>
      <Nav logo="Pushing Platform" />
      <main className="page">
        {/* Hero */}
        <section className="hero">
          <div className="hero-eyebrow tag tag-green">⚡ Platform Suite — v1</div>
          <h1>Built to<br />push capital.</h1>
          <p>Three tools. One platform. Designed for operators who move fast and need infrastructure that keeps up.</p>
        </section>

        {/* Product cards */}
        <section style={{ padding: '0 0 4rem' }}>
          <div className="container grid-3">
            {PRODUCTS.map(p => (
              <Link key={p.href} href={p.href} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer', height: '100%' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{p.emoji}</div>
                  <div className={`tag ${p.tagClass}`} style={{ marginBottom: '0.75rem' }}>{p.tag}</div>
                  <h3 style={{ color: p.accent, marginBottom: '0.5rem' }}>{p.name}</h3>
                  <p style={{ fontSize: '0.85rem' }}>{p.desc}</p>
                  <div style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: p.accent, fontWeight: 700 }}>
                    Open →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom strip */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '1.5rem 1.25rem',
          textAlign: 'center',
          fontSize: '0.72rem',
          color: 'var(--muted)',
        }}>
          Pushing Capital, LLC · brain-481809 · {new Date().getFullYear()}
        </div>
      </main>
    </>
  );
}
