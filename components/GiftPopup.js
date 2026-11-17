'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GiftPopup({ section }) {
  const [show, setShow] = useState(false);

  const textMap = {
    men: 'Gifting him?',
    women: 'Gifting her?',
    kids: 'Gifting a little one?',
    default: 'Looking for a gift?',
  };

  const headline = textMap[section] || textMap.default;

  useEffect(() => {
    const dismissed = localStorage.getItem('gift_popup_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) return;
    }
    const timer = setTimeout(() => setShow(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('gift_popup_dismissed', Date.now().toString());
  };

  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-50 animate-fade-in"
        onClick={dismiss}
      />

      {/* Desktop Modal / Mobile Bottom Sheet */}
      <div className="fixed z-50 animate-slide-up
        bottom-0 left-0 right-0 md:bottom-auto md:left-1/2 md:top-1/2
        md:-translate-x-1/2 md:-translate-y-1/2 md:w-auto md:max-w-md">
        <div className="bg-brand-gray border border-brand-gold rounded-t-2xl md:rounded-2xl p-6 md:p-8 relative mx-auto max-h-[60vh] md:max-h-none overflow-y-auto">
          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-gray-2 transition-colors"
            aria-label="Close popup"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="text-center">
            <div className="text-4xl mb-3">🎁</div>
            <h3 className="font-display text-2xl text-brand-gold mb-2 uppercase tracking-wider">
              {headline}
            </h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Check out our curated gift stores — perfect tees and hoodies for everyone!
            </p>
            <Link
              href="/gifts"
              onClick={dismiss}
              className="btn-gold w-full text-center block mb-3"
            >
              View Gift Stores →
            </Link>
            <button
              onClick={dismiss}
              className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
            >
              No thanks, continue browsing
            </button>
            <p className="text-gray-600 text-[10px] mt-4">We may earn a commission.</p>
          </div>
        </div>
      </div>
    </>
  );
}
