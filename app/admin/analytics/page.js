'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center text-gray-500 text-xs uppercase tracking-widest">
        Loading analytics engine...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-16 text-center text-red-400">
        Failed to load analytics data.
      </div>
    );
  }

  // Estimated gross pipeline (~₹750 average cart * 5% commission = ₹37.5 per purchase)
  const estEarnings = stats.total * 37.5;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            <span>/</span>
            <span className="text-white">Analytics Suite</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-wide">
            Traffic &amp; Affiliate Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time tracking of shoppers browsing your drops and clicking through to partner stores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
          >
            ↻ Refresh Data
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-[#121217] border border-white/10 rounded-3xl p-6">
          <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2">Total Referrals</div>
          <div className="font-display text-5xl text-[#C6FF3D] mb-1">{stats.total}</div>
          <p className="text-gray-500 text-xs">All-time outbound shopper clicks</p>
        </div>

        <div className="bg-[#121217] border border-white/10 rounded-3xl p-6">
          <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2">Today's Traffic</div>
          <div className="font-display text-5xl text-white mb-1">{stats.today}</div>
          <p className="text-gray-500 text-xs">Direct shopper clicks in last 24h</p>
        </div>

        <div className="bg-[#121217] border border-white/10 rounded-3xl p-6">
          <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2">This Month</div>
          <div className="font-display text-5xl text-[#FF3D81] mb-1">{stats.thisMonth}</div>
          <p className="text-gray-500 text-xs">Monthly cumulative referrals</p>
        </div>

        <div className="bg-[#121217] border border-white/10 rounded-3xl p-6">
          <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2">Est. Commission Potential</div>
          <div className="font-display text-5xl text-green-400 mb-1">₹{Math.round(estEarnings).toLocaleString()}</div>
          <p className="text-gray-500 text-xs">Based on standard apparel rates</p>
        </div>

      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Top Clicked Products Leaderboard */}
        <div className="lg:col-span-7 bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8">
          <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-1">
            Top Performing Products
          </h3>
          <p className="text-gray-400 text-xs mb-6">Which designs generate the most buying intent</p>

          {stats.topProducts.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs uppercase tracking-wider">
              No product clicks recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-white/10 font-bold text-xs flex items-center justify-center text-gray-300">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm truncate">{p.name}</p>
                      <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full font-bold uppercase mt-0.5 inline-block">
                        {p.store}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-display text-2xl text-[#C6FF3D]">{p.clicks}</span>
                    <span className="text-gray-500 text-[10px] block uppercase font-bold">clicks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Store Share */}
        <div className="lg:col-span-5 bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8">
          <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-1">
            Partner Store Distribution
          </h3>
          <p className="text-gray-400 text-xs mb-6">Traffic share across affiliate programs</p>

          {Object.keys(stats.storeBreakdown).length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs uppercase tracking-wider">
              No store distribution data yet.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(stats.storeBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([store, count]) => {
                  const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={store} className="bg-white/5 p-4 rounded-2xl">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-bold text-white">{store}</span>
                        <span className="text-[#C6FF3D] font-bold text-xs">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C6FF3D] rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          <div className="mt-8 p-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs leading-relaxed">
            💡 <strong>Unicorn Insight:</strong> When a product gets 20+ clicks consistently, you have validated demand — you can manufacture your own version for 60%+ profit margin!
          </div>
        </div>

      </div>

      {/* Complete Click Audit Log */}
      <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8">
        <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-1">
          Recent Outbound Click Audit Trail
        </h3>
        <p className="text-gray-400 text-xs mb-6">Live verified stream of outbound visitor clicks</p>

        {stats.recent.length === 0 ? (
          <p className="text-center py-10 text-gray-500 text-xs uppercase tracking-wider">
            No live click logs yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Partner Store</th>
                  <th className="py-3.5 px-4">Destination Link</th>
                  <th className="py-3.5 px-4 text-right">Logged Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recent.map((click) => (
                  <tr key={click.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{click.productName}</td>
                    <td className="py-3 px-4">
                      <span className="bg-white/10 text-gray-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {click.store}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-400 text-[11px] truncate max-w-xs">
                      {click.affiliateLink}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400 font-mono">
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
