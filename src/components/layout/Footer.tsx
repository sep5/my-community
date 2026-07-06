import Link from 'next/link';

const MENU_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/community', label: 'Community' },
  { href: '/community?sort=popular', label: 'Popular' },
  { href: '/post/create', label: '글 작성하기' },
];

const SOCIAL_LINKS = [
  { href: '#', label: 'Instagram' },
  { href: '#', label: 'Pinterest' },
  { href: '#', label: 'Twitter' },
];

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ backgroundColor: '#8C2018' }}>
      <div className="section-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Col 1 — Logo */}
          <div className="md:col-span-1">
            <Link href="/" className="text-editorial text-3xl md:text-4xl font-bold italic text-white tracking-tight">
              My Community
            </Link>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              조용한 숲속의 갤러리.<br />
              당신의 이야기를 나눠보세요.
            </p>
          </div>

          {/* Col 2 — Menu */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>Menu</h3>
            <ul className="space-y-2.5">
              {MENU_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-sm transition-colors duration-200" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Social */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>Social</h3>
            <ul className="space-y-2.5">
              {SOCIAL_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <a href={href} className="text-sm transition-colors duration-200" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Subscribe */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>More ideas. More stories.</h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              새 글과 소식을 가장 먼저 받아보세요.
            </p>
            <div className="flex items-center">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 min-w-0 px-0 py-2 text-sm bg-transparent border-b text-white focus:outline-none transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.35)', color: 'white' }}
              />
              <button
                type="button"
                className="ml-3 text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                aria-label="구독"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            © {new Date().getFullYear()} My Community. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Privacy policy</p>
        </div>
      </div>
    </footer>
  );
}
