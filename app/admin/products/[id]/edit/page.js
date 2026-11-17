'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm(data);
        setFetchLoading(false);
      })
      .catch(() => {
        setError('Failed to load product details.');
        setFetchLoading(false);
      });
  }, [params.id]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/admin/products'), 1200);
      } else {
        const data = await res.json();
        setError(data.error || 'Update failed.');
      }
    } catch {
      setError('Communication error while updating product.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-16 text-center text-gray-500 text-xs uppercase tracking-widest">
        Loading product details...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-16 text-center text-red-400">
        Product not found.{' '}
        <Link href="/admin/products" className="underline text-white">Back to catalog</Link>
      </div>
    );
  }

  const discount = form.originalPrice && form.price && parseInt(form.originalPrice) > parseInt(form.price)
    ? Math.round(((parseInt(form.originalPrice) - parseInt(form.price)) / parseInt(form.originalPrice)) * 100)
    : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link href="/admin/products" className="hover:text-white">Catalog</Link>
            <span>/</span>
            <span className="text-white">Edit Product</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-wide">
            Edit: {form.name}
          </h1>
          <p className="text-gray-500 font-mono text-xs mt-1">ID: {params.id}</p>
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
            <p className="text-green-400 font-bold text-sm">Changes Saved Successfully!</p>
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
        
        {/* Form Fields (8 Cols) */}
        <div className="lg:col-span-8 bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6FF3D]"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6FF3D]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                Original MRP (₹)
              </label>
              <input
                type="number"
                min="1"
                value={form.originalPrice || ''}
                onChange={(e) => set('originalPrice', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6FF3D]"
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6FF3D]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
              Image URL *
            </label>
            <input
              type="url"
              required
              value={form.image}
              onChange={(e) => set('image', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6FF3D]"
            />
          </div>

          <div className="flex flex-wrap gap-8 pt-2">
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

          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : '💾 Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
          </div>

        </div>

        {/* Right Preview Card (4 Cols) */}
        <div className="lg:col-span-4 bg-[#121217] border border-white/10 rounded-3xl p-6 sticky top-24">
          <p className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-4">
            Live Preview
          </p>

          <div className="bg-[#181820] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="aspect-[4/5] bg-black relative overflow-hidden flex items-center justify-center">
              <img
                src={form.image}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/400x500/1A1A1A/C6FF3D?text=IMAGE+ERROR'; }}
              />

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
                <span className="bg-black/80 text-gray-300 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                  {form.store}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-[10px] text-gray-500 uppercase font-bold">
                {form.category} • {form.subCategory}
              </p>
              <h4 className="text-white font-bold text-sm line-clamp-2">
                {form.name}
              </h4>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-white font-black text-lg">
                  ₹{parseInt(form.price).toLocaleString()}
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
