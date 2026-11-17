'use client';
import Link from 'next/link';
import { useState } from 'react';

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || 'Novique';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-black/95 backdrop-blur-sm border-b border-brand-gray-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-display text-2xl text-brand-gold tracking-widest">
            {BRAND}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/men" className="nav-link">Men</Link>
            <Link href="/women" className="nav-link">Women</Link>
            <Link href="/kids" className="nav-link">Kids</Link>
            <Link href="/gifts" className="nav-link">Gifts 🎁</Link>
          </nav>

          {/* CTA + Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link href="/men" className="hidden md:inline-flex btn-gold text-xs py-2 px-4">
              Shop Now
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white p-2"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-brand-gray-2 py-4 animate-fade-in">
            <nav className="flex flex-col gap-4">
              <Link href="/men" className="nav-link" onClick={() => setMenuOpen(false)}>Men</Link>
              <Link href="/women" className="nav-link" onClick={() => setMenuOpen(false)}>Women</Link>
              <Link href="/kids" className="nav-link" onClick={() => setMenuOpen(false)}>Kids</Link>
              <Link href="/gifts" className="nav-link" onClick={() => setMenuOpen(false)}>Gifts 🎁</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
