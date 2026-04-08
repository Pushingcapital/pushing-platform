'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PRODUCTS = [
  { href: '/security', label: '🛡 Security', accent: 'var(--security-accent)' },
  { href: '/user-one', label: '⬡ UserOne',  accent: 'var(--userone-accent)' },
  { href: '/forms',    label: '📋 Forms',    accent: 'var(--forms-accent)' },
];

export default function Nav({ accent = 'var(--green)', logo, cta }) {
  const path = usePathname();
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo" style={{ color: accent }}>
          {logo || 'Pushing<em>Platform</em>'}
        </Link>
        <div className="nav-links">
          {PRODUCTS.map(p => (
            <Link
              key={p.href}
              href={p.href}
              className={`nav-link${path === p.href ? ' active' : ''}`}
            >
              {p.label}
            </Link>
          ))}
          {cta && (
            <a
              href={cta.href || '#'}
              className="nav-cta btn-sm btn"
              style={{ background: accent, color: '#000' }}
            >
              {cta.label}
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
