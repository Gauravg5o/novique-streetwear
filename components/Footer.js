import Link from 'next/link';

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || 'Novique';

export default function Footer() {
  return (
    <footer className="bg-brand-gray border-t border-brand-gray-2 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="font-display text-3xl text-brand-gold tracking-widest mb-3">{BRAND}</div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-sm">
              Ego. Obsession. Greatness. We curate the best T-shirts and Hoodies for those who are obsessed with winning.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              We may earn a commission when you buy through our links, at no extra cost to you.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Shop</h4>
            <ul className="space-y-2">
              {[['Men', '/men'], ['Women', '/women'], ['Kids', '/kids'], ['Gifts', '/gifts']].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 text-sm hover:text-brand-gold transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Info</h4>
            <ul className="space-y-2">
              {[['About Us', '/about'], ['Affiliate Disclosure', '/disclosure'], ['Privacy Policy', '/privacy']].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 text-sm hover:text-brand-gold transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-gray-2 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">© 2026 {BRAND}. All rights reserved.</p>
          <p className="text-gray-500 text-xs">
            Affiliate Disclosure: We earn commissions on qualifying purchases through our links.
          </p>
        </div>
      </div>
    </footer>
  );
}
