'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { label: 'Executive Dashboard', href: '/admin', icon: '📊' },
  { label: 'Catalog Manager', href: '/admin/products', icon: '👕' },
  { label: 'Add New Product', href: '/admin/products/new', icon: '➕' },
  { label: 'Click & Traffic Analytics', href: '/admin/analytics', icon: '📈' },
  { label: 'Live Storefront', href: '/', icon: '🌐', external: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <aside className="w-72 min-h-screen bg-[#0D0D11] border-r border-white/10 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C6FF3D] text-black font-black flex items-center justify-center text-lg shadow-lg shadow-[#C6FF3D]/20">
              NQ
            </div>
            <div>
              <div className="font-display text-2xl text-white tracking-wider">NOVIQUE</div>
              <p className="text-[10px] uppercase tracking-widest text-[#C6FF3D] font-bold">Store Admin Suite</p>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" title="System Live" />
        </div>

        {/* Store Quick Status */}
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Store Status</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-white font-medium">Production Storefront</span>
            <span className="text-[10px] bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-full">Online</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = !item.external && pathname === item.href;
            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold uppercase tracking-wider group"
              >
                <span className="text-base">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                <span className="text-gray-600 group-hover:text-[#C6FF3D] transition-colors">↗</span>
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-semibold uppercase tracking-wider
                  ${isActive
                    ? 'bg-[#C6FF3D] text-black font-extrabold shadow-md shadow-[#C6FF3D]/15'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin User / Logout Footer */}
      <div className="p-4 border-t border-white/10 bg-white/[0.01]">
        <div className="flex items-center gap-3 px-4 py-2.5 mb-2 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-black font-bold flex items-center justify-center text-xs">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Store Admin</p>
            <p className="text-[10px] text-gray-500 truncate">admin@novique.com</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-xs font-bold uppercase tracking-wider"
        >
          <span>🚪</span>
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </aside>
  );
}
