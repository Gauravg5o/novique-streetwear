'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'men', label: "Men's Wear" },
  { id: 'women', label: "Women's Wear" },
  { id: 'kids', label: "Kids' Drip" },
];

const SUB_CATEGORIES = [
  { id: 'tshirt', label: 'T-Shirt' },
  { id: 'hoodie', label: 'Hoodie / Sweatshirt' },
];

const FILTERS = {
  men: ['graphic', 'oversized', 'plain', 'polo', 'zipper', 'pullover'],
  women: ['crop', 'oversized', 'graphic', 'plain', 'zipper', 'pullover'],
  kids: ['boys', 'girls', 'age-2-5', 'age-6-12'],
};

const STORES = ['Amazon', 'Myntra', 'Flipkart', 'Ajio', 'Bewakoof', 'Other'];

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    category: 'men',
    subCategory: 'tshirt',
    filter: 'graphic',
    price: '',
    originalPrice: '',
    image: '',
    affiliateLink: '',
    store: 'Amazon',
    featured: true,
    trending: false,
    active: true,
  });

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const discount = form.originalPrice && form.price && parseInt(form.originalPrice) > parseInt(form.price)
    ? Math.round(((parseInt(form.originalPrice) - parseInt(form.price)) / parseInt(form.originalPrice)) * 100)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/admin/products'), 1200);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add product to catalog.');
      }
    } catch {
      setError('Network communication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link href="/admin/products" className="hover:text-white">Catalog</Link>
            <span>/</span>
            <span className="text-white">Add New Drop</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-wide">
            Add Product to Catalog
          </h1>
        </div>

        <Link
          href="/admin/products"
          className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
        >
          ← Cancel &amp; Back
        </Link>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-green-400 font-bold text-sm">Product Published Successfully!</p>
            <p className="text-gray-400 text-xs">Redirecting to Catalog Manager...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-xs">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form (8 Cols) */}
        <div className="lg:col-span-8 bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          
          <h3 className="font-display text-xl text-white uppercase tracking-wider mb-2">
            1. Basic Information
          </h3>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Novique Heavyweight Oversized Acid-Wash Tee"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                Department *
              </label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full bg-[#181820] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6FF3D]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                Product Type *
              </label>
              <select
                value={form.subCategory}
                onChange={(e) => set('subCategory', e.target.value)}
                className="w-full bg-[#181820] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6FF3D]"
              >
                {SUB_CATEGORIES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                Style / Fit Tag
              </label>
              <select
                value={form.filter}
                onChange={(e) => set('filter', e.target.value)}
                className="w-full bg-[#181820] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6FF3D]"
              >
                {(FILTERS[form.category] || []).map((f) => (
                  <option key={f} value={f}>{f.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h3 className="font-display text-xl text-white uppercase tracking-wider mb-4">
              2. Pricing &amp; Partner Store
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="599"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                  Original MRP (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.originalPrice}
                  onChange={(e) => set('originalPrice', e.target.value)}
                  placeholder="1299"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                  Partner Store *
                </label>
                <select
                  value={form.store}
                  onChange={(e) => set('store', e.target.value)}
                  className="w-full bg-[#181820] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6FF3D]"
                >
                  {STORES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                Affiliate Destination Link *
              </label>
              <input
                type="url"
                required
                value={form.affiliateLink}
                onChange={(e) => set('affiliateLink', e.target.value)}
                placeholder="https://www.amazon.in/dp/.../?tag=novique-21"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D]"
              />
              <p className="text-gray-500 text-[11px] mt-1.5">
                Paste your exact tracking URL from Amazon Associates, Myntra, or Flipkart.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h3 className="font-display text-xl text-white uppercase tracking-wider mb-4">
              3. Media &amp; Product Image
            </h3>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                High-Resolution Image URL *
              </label>
              <input
                type="url"
                required
                value={form.image}
                onChange={(e) => set('image', e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D]"
              />
              <p className="text-gray-500 text-[11px] mt-1.5">
                Direct image URL (WebP, JPG, or PNG). Preview updates automatically on the right panel.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap gap-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set('active', e.target.checked)}
                className="w-4 h-4 accent-[#C6FF3D]"
              />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Live on Storefront</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.trending}
                onChange={(e) => set('trending', e.target.checked)}
                className="w-4 h-4 accent-[#FF3D81]"
              />
              <span className="text-xs font-bold text-white uppercase tracking-wider">🔥 Trending Flag</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="w-4 h-4 accent-amber-400"
              />
              <span className="text-xs font-bold text-white uppercase tracking-wider">⭐ Featured Drop</span>
            </label>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-extrabold py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#C6FF3D]/20 disabled:opacity-50"
            >
              {loading ? 'Publishing to Storefront...' : 'Publish Product to Novique Storefront ⚡'}
            </button>
          </div>

        </div>

        {/* Right Preview Card (4 Cols) */}
        <div className="lg:col-span-4 bg-[#121217] border border-white/10 rounded-3xl p-6 sticky top-24">
          <p className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-4 flex items-center justify-between">
            <span>Live Customer Preview</span>
            <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">Real-time</span>
          </p>

          <div className="bg-[#181820] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="aspect-[4/5] bg-black/60 relative overflow-hidden flex items-center justify-center">
              {form.image ? (
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://placehold.co/400x500/1A1A1A/C6FF3D?text=INVALID+IMAGE+URL'; }}
                />
              ) : (
                <div className="text-center p-6 text-gray-600">
                  <span className="text-4xl block mb-2">📸</span>
                  <p className="text-xs uppercase tracking-wider">Paste image URL to see live preview</p>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {form.trending && (
                  <span className="bg-[#FF3D81] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                    🔥 Trending
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-[#C6FF3D] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                    -{discount}%
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3">
                <span className="bg-black/80 backdrop-blur-md text-gray-300 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                  {form.store}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-[10px] text-gray-500 uppercase font-bold">
                {form.category} • {form.subCategory}
              </p>
              <h4 className="text-white font-bold text-sm line-clamp-2">
                {form.name || 'Your Product Title Will Appear Here'}
              </h4>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-white font-black text-lg">
                  ₹{form.price ? parseInt(form.price).toLocaleString() : '0'}
                </span>
                {form.originalPrice && (
                  <span className="text-gray-500 text-xs line-through">
                    ₹{parseInt(form.originalPrice).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="w-full text-center bg-[#C6FF3D] text-black font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider mt-3">
                Buy on {form.store} ↗
              </div>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
}
