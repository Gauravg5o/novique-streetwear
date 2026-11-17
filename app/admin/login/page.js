'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials. Please verify your login details.');
      }
    } catch {
      setError('Communication error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F5F5F0] flex items-center justify-center px-4 font-sans selection:bg-[#C6FF3D] selection:text-black">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#C6FF3D] text-black font-black flex items-center justify-center text-2xl shadow-xl shadow-[#C6FF3D]/25">
            NQ
          </div>
          <div className="font-display text-4xl text-white tracking-wider mb-1">NOVIQUE</div>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Store Management Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#121217] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-white font-bold text-lg mb-2">Store Owner Authentication</h1>
          <p className="text-gray-400 text-xs mb-6">Restricted access area for Novique administrators.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-red-400 text-xs">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D] transition-colors"
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D] transition-colors pr-14"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-semibold"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C6FF3D]/20 disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-gray-500">
            Default credentials: <code className="text-[#C6FF3D] bg-white/5 px-2 py-0.5 rounded">admin</code> / <code className="text-[#C6FF3D] bg-white/5 px-2 py-0.5 rounded">Novique@2026</code>
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-gray-500">
          Return to{' '}
          <Link href="/" className="text-[#C6FF3D] hover:underline font-semibold">
            Novique Storefront →
          </Link>
        </p>

      </div>
    </div>
  );
}
