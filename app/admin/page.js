import Link from 'next/link';
import { getAllProducts } from '@/lib/products';
import { getClickStats } from '@/lib/clicks';

export const metadata = { title: 'Executive Dashboard — Novique Admin' };

export default function AdminDashboard() {
  const products = getAllProducts();
  const stats = getClickStats();

  const activeProducts = products.filter((p) => p.active).length;
  const trendingProducts = products.filter((p) => p.trending).length;
  const featuredProducts = products.filter((p) => p.featured).length;

  const categoryCount = { men: 0, women: 0, kids: 0, hoodie: 0 };
  products.forEach((p) => {
    if (categoryCount[p.category] !== undefined) categoryCount[p.category]++;
    if (p.subCategory === 'hoodie') categoryCount.hoodie++;
  });

  // Estimated gross affiliate pipeline: assuming ~₹750 average order value at ~5% commission = ₹37.5 per purchase
  const estimatedOrderValue = stats.total * 37.5;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-fadeIn">
      
      {/* Top Banner & Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C6FF3D]/10 text-[#C6FF3D] text-[11px] font-bold uppercase tracking-widest mb-3">
            <span className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-ping" />
            Novique Command Suite v2.0
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-wide">
            Executive Store Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Complete real-time control of your catalog, affiliate outbound traffic &amp; store inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C6FF3D]/20 flex items-center gap-2"
          >
            <span>➕</span> Add New Product
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <span>🌐</span> Open Live Store ↗
          </a>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Products */}
        <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#C6FF3D]/50 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs uppercase font-bold tracking-wider">Catalog Inventory</span>
            <span className="text-2xl">👕</span>
          </div>
          <div className="font-display text-4xl text-white mb-1">{products.length}</div>
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span className="text-green-400 font-bold">{activeProducts} Active</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{trendingProducts} Trending</span>
          </div>
        </div>

        {/* Total Outbound Clicks */}
        <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#C6FF3D]/50 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs uppercase font-bold tracking-wider">Total Outbound Clicks</span>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="font-display text-4xl text-[#C6FF3D] mb-1">{stats.total}</div>
          <div className="text-xs text-gray-400">
            Shoppers redirected to partner stores
          </div>
        </div>

        {/* Today's Clicks */}
        <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#C6FF3D]/50 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs uppercase font-bold tracking-wider">Today's Traffic</span>
            <span className="text-2xl">📅</span>
          </div>
          <div className="font-display text-4xl text-white mb-1">{stats.today}</div>
          <div className="text-xs text-gray-400">
            <span className="text-[#FF3D81] font-bold">{stats.thisMonth}</span> clicks this month
          </div>
        </div>

        {/* Estimated Value */}
        <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#C6FF3D]/50 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs uppercase font-bold tracking-wider">Commission Pipeline</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="font-display text-4xl text-green-400 mb-1">
            ₹{Math.round(estimatedOrderValue).toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            Est. commission potential (~5% rate)
          </div>
        </div>

      </div>

      {/* Middle Section: Store Breakdown & Category Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Partner Store Traffic Distribution */}
        <div className="lg:col-span-7 bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-2xl text-white uppercase tracking-wider">
                Outbound Partner Traffic
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">Where your visitors are purchasing</p>
            </div>
            <Link href="/admin/analytics" className="text-xs text-[#C6FF3D] hover:underline font-bold uppercase tracking-wider">
              Full Analytics →
            </Link>
          </div>

          {Object.keys(stats.storeBreakdown).length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs uppercase tracking-wider">
              No click events recorded yet. Share your storefront link to start tracking!
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(stats.storeBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([store, count]) => {
                  const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={store} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-bold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#C6FF3D]" />
                          {store}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-xs">{count} clicks</span>
                          <span className="text-[#C6FF3D] font-bold text-xs">{percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C6FF3D] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-5 bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-1">
              Category Distribution
            </h3>
            <p className="text-gray-400 text-xs mb-6">Inventory balance across departments</p>

            <div className="space-y-4">
              {[
                { label: "Men's Collection", count: categoryCount.men, icon: '👕' },
                { label: "Women's Collection", count: categoryCount.women, icon: '✨' },
                { label: "Kids' Collection", count: categoryCount.kids, icon: '🌟' },
                { label: "Hoodies & Jackets", count: categoryCount.hoodie, icon: '🧥' },
              ].map((c) => (
                <div key={c.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{c.icon}</span>
                    <span className="text-sm font-semibold text-white">{c.label}</span>
                  </div>
                  <span className="font-display text-lg text-[#C6FF3D]">{c.count} items</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <Link
              href="/admin/products"
              className="w-full block text-center bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Manage All Products →
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Live Clicks Stream */}
      <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-2xl text-white uppercase tracking-wider">
              Live Click Activity Feed
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">Real-time audit log of customer outbound referrals</p>
          </div>
          <span className="text-xs text-gray-500 font-mono">Auto-logging active</span>
        </div>

        {stats.recent.length === 0 ? (
          <p className="text-center py-10 text-gray-500 text-xs uppercase tracking-wider">
            No clicks recorded yet. When a visitor clicks "Buy on Store", it will show here!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Product Name</th>
                  <th className="pb-3 font-semibold">Partner Store</th>
                  <th className="pb-3 font-semibold">Destination URL</th>
                  <th className="pb-3 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recent.slice(0, 10).map((click) => (
                  <tr key={click.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 text-white font-medium">{click.productName}</td>
                    <td className="py-3.5">
                      <span className="bg-white/10 text-gray-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {click.store}
                      </span>
                    </td>
                    <td className="py-3.5 text-gray-400 font-mono text-[11px] truncate max-w-xs">
                      {click.affiliateLink}
                    </td>
                    <td className="py-3.5 text-right text-gray-400 font-mono">
                      {new Date(click.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
