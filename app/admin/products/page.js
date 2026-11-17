'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterStore, setFilterStore] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleActive = async (product) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !product.active }),
      });
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.store.toLowerCase().includes(search.toLowerCase()) ||
                          (p.filter && p.filter.toLowerCase().includes(search.toLowerCase()));
      const matchCat = filterCat === 'all' || p.category === filterCat;
      const matchStore = filterStore === 'all' || p.store.toLowerCase() === filterStore.toLowerCase();
      return matchSearch && matchCat && matchStore;
    });
  }, [products, search, filterCat, filterStore]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-wide">
            Product Catalog Manager
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage live visibility, edit links, adjust prices, and audit your drops ({products.length} total items).
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C6FF3D]/20 self-start sm:self-auto flex items-center gap-2"
        >
          <span>➕</span> Add New Product
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121217] border border-white/10 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search by title, fit, store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="bg-[#181820] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C6FF3D]"
          >
            <option value="all">All Departments</option>
            <option value="men">Men's</option>
            <option value="women">Women's</option>
            <option value="kids">Kids'</option>
          </select>

          {/* Store Dropdown */}
          <select
            value={filterStore}
            onChange={(e) => setFilterStore(e.target.value)}
            className="bg-[#181820] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C6FF3D]"
          >
            <option value="all">All Partner Stores</option>
            <option value="amazon">Amazon</option>
            <option value="myntra">Myntra</option>
            <option value="flipkart">Flipkart</option>
            <option value="bewakoof">Bewakoof</option>
            <option value="ajio">Ajio</option>
          </select>
        </div>

        <div className="text-xs text-gray-400">
          Showing <span className="text-[#C6FF3D] font-bold">{filtered.length}</span> of {products.length} items
        </div>
      </div>

      {/* Catalog Table */}
      {loading ? (
        <div className="py-24 text-center text-gray-500 text-xs uppercase tracking-widest">
          Loading catalog data...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-3xl p-8">
          <span className="text-4xl block mb-2">📦</span>
          <p className="text-white font-bold text-base mb-1">No products match your filters</p>
          <p className="text-gray-400 text-xs mb-4">Try clearing your search query or reset the store filter.</p>
          <button
            onClick={() => { setSearch(''); setFilterCat('all'); setFilterStore('all'); }}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-[#121217] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Product &amp; ID</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Store</th>
                  <th className="py-4 px-4 text-center">Storefront Visibility</th>
                  <th className="py-4 px-4 text-center">Badges</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((p) => {
                  const discount = p.originalPrice
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : 0;

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      
                      {/* Product Image & Title */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-14 object-cover rounded-xl border border-white/10 bg-black"
                          />
                          <div className="max-w-xs">
                            <p className="text-white font-semibold text-sm line-clamp-1">{p.name}</p>
                            <p className="text-gray-500 font-mono text-[10px]">{p.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Fit */}
                      <td className="py-4 px-4">
                        <span className="text-white capitalize font-medium">{p.category}</span>
                        <span className="text-gray-500 text-[11px] block">{p.subCategory} • {p.filter || 'all'}</span>
                      </td>

                      {/* Pricing */}
                      <td className="py-4 px-4">
                        <span className="text-[#C6FF3D] font-bold text-sm">₹{p.price.toLocaleString()}</span>
                        {p.originalPrice && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-gray-500 text-[10px] line-through">₹{p.originalPrice.toLocaleString()}</span>
                            <span className="text-gray-400 text-[9px] font-bold">-{discount}%</span>
                          </div>
                        )}
                      </td>

                      {/* Store */}
                      <td className="py-4 px-4">
                        <span className="bg-white/10 text-gray-300 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase">
                          {p.store}
                        </span>
                      </td>

                      {/* Visibility Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleActive(p)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                            p.active
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-gray-500/20 text-gray-500 border border-gray-500/30'
                          }`}
                          title="Click to toggle store visibility"
                        >
                          {p.active ? '● Live' : '○ Hidden'}
                        </button>
                      </td>

                      {/* Badges */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {p.trending && (
                            <span className="bg-[#FF3D81]/20 text-[#FF3D81] text-[10px] font-bold px-2 py-0.5 rounded-md" title="Trending on storefront">
                              🔥
                            </span>
                          )}
                          {p.featured && (
                            <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md" title="Featured item">
                              ⭐
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Test Link */}
                          <a
                            href={p.affiliateLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-400 hover:text-[#C6FF3D] transition-colors p-1"
                            title="Verify Affiliate Link"
                          >
                            ↗
                          </a>

                          {/* Edit Link */}
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="bg-white/5 hover:bg-white/10 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] uppercase transition-all"
                          >
                            Edit
                          </Link>

                          {/* Delete Button */}
                          <button
                            onClick={() => deleteProduct(p.id)}
                            disabled={deleting === p.id}
                            className="text-red-400 hover:text-red-300 font-bold px-2 py-1 text-[11px] uppercase disabled:opacity-50"
                          >
                            {deleting === p.id ? '...' : 'Del'}
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
