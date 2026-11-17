'use client';

import { useState, useEffect, useMemo } from 'react';
import initialProducts from '@/data/products.json';

export default function UnifiedNoviqueApp() {
  // Top-level View Mode: 'store' or 'admin'
  const [currentView, setCurrentView] = useState('store');

  // AUTH STATE (Dynamic Role-based)
  const [currentUser, setCurrentUser] = useState(null); // { email, name, role }
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [signupStep, setSignupStep] = useState('form'); // 'form' or 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  // STOREFRONT STATES
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all'); // all, men, women, kids, hoodie, gifts
  const [activeSubFilter, setActiveSubFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);

  // ADMIN DASHBOARD STATES
  const [adminTab, setAdminTab] = useState('overview'); // overview, products, add, analytics
  const [adminStats, setAdminStats] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCatFilter, setAdminCatFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
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
    trending: true,
    active: true,
  });

  // Fetch initial products, current session & local storage
  useEffect(() => {
    document.title = currentView === 'admin' ? 'Novique — Executive Admin Suite' : 'Novique — Wear The Drop';
    checkCurrentUser();
    fetchProducts();
    fetchStats();

    // Listen for OAuth Success (Google, Facebook, Discord)
    const handleOAuthMessage = (event) => {
      if (event.data && event.data.type === 'AUTH_SUCCESS' && event.data.user) {
        setCurrentUser(event.data.user);
        setShowAuthModal(false);
        setSocialLoading(null);
        if (event.data.user.role === 'admin') {
          fetchStats();
        }
      }
    };
    window.addEventListener('message', handleOAuthMessage);

    try {
      const savedWishlist = JSON.parse(localStorage.getItem('novique_wishlist') || '[]');
      setWishlist(savedWishlist);
    } catch {}

    const popupDismissed = localStorage.getItem('novique_gift_dismissed');
    if (!popupDismissed) {
      const t = setTimeout(() => setShowGiftModal(true), 9000);
      return () => {
        clearTimeout(t);
        window.removeEventListener('message', handleOAuthMessage);
      };
    }

    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [currentView]);

  const checkCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      }
    } catch (e) {
      console.error('Session check failed:', e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      }
    } catch (e) {
      console.error('Error fetching products:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
      }
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  };

  const toggleWishlist = (id) => {
    let updated;
    if (wishlist.includes(id)) {
      updated = wishlist.filter((item) => item !== id);
    } else {
      updated = [...wishlist, id];
    }
    setWishlist(updated);
    localStorage.setItem('novique_wishlist', JSON.stringify(updated));
  };

  // DYNAMIC AUTHENTICATION (Login, Sign Up & Social)
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setShowAuthModal(false);
        setAuthPassword('');
        setAuthError('');

        // If logged in as admin, fetch stats immediately
        if (data.user.role === 'admin') {
          fetchStats();
        }
      } else {
        setAuthError(data.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch {
      setAuthError('Connection error during login. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Step 1: Send 6-Digit Email Verification Code (OTP)
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (authPassword !== authConfirmPassword) {
      setAuthError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (authPassword.length < 4) {
      setAuthError('Password must be at least 4 characters long.');
      return;
    }

    setAuthLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          password: authPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSignupStep('otp');
        setOtpCode('');
        if (data.devCode) {
          setAuthSuccess(`Verification code generated: ${data.devCode}. Enter it below to activate your account.`);
        } else {
          setAuthSuccess(`A 6-digit verification code has been dispatched to ${authEmail}. Please check your inbox.`);
        }
      } else {
        setAuthError(data.error || 'Failed to send verification code.');
      }
    } catch {
      setAuthError('Connection error while sending verification code. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Step 2: Verify 6-Digit Code & Permanently Activate Account
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setAuthError('Please enter the full 6-digit verification code.');
      return;
    }

    setAuthLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          code: otpCode.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAuthSuccess('✅ Email successfully verified! Logging you in...');
        setTimeout(() => {
          setCurrentUser(data.user);
          setShowAuthModal(false);
          setSignupStep('form');
          setOtpCode('');
          setAuthPassword('');
          setAuthConfirmPassword('');
          setAuthName('');
          setAuthSuccess('');
        }, 900);
      } else {
        setAuthError(data.error || 'Verification failed. Invalid or expired code.');
      }
    } catch {
      setAuthError('Connection error during verification. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setSocialLoading(provider);
    setAuthError('');
    setAuthSuccess('');

    // Open authentic OAuth popup window (Google / Facebook / Discord)
    const width = 500;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `/api/auth/oauth/${provider}`,
      `${provider}_oauth_window`,
      `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0,menubar=0,location=1`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      // Fallback if browser blocks popup: open directly
      window.location.href = `/api/auth/oauth/${provider}`;
    }

    // Set short timer to clear loading state if user closes popup without logging in
    const checkClosedInterval = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkClosedInterval);
        setSocialLoading(null);
      }
    }, 1000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setShowUserMenu(false);
    setCurrentView('store');
  };

  // ADMIN ACTIONS
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        alert('✅ Product added successfully to Novique catalog!');
        setNewProduct({
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
          trending: true,
          active: true,
        });
        await fetchProducts();
        setAdminTab('products');
      } else {
        alert('Failed to add product. Make sure price and URLs are valid.');
      }
    } catch {
      alert('Error creating product.');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        alert('✅ Product updated successfully!');
        setEditingProduct(null);
        await fetchProducts();
      } else {
        alert('Failed to update product.');
      }
    } catch {
      alert('Error saving product.');
    }
  };

  const toggleProductActive = async (product) => {
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
    setDeletingId(id);
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      await fetchProducts();
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  // STOREFRONT FILTERED PRODUCTS
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      if (showWishlistOnly && !wishlist.includes(p.id)) return false;

      if (activeCategory === 'men' && p.category !== 'men') return false;
      if (activeCategory === 'women' && p.category !== 'women') return false;
      if (activeCategory === 'kids' && p.category !== 'kids') return false;
      if (activeCategory === 'hoodie' && p.subCategory !== 'hoodie') return false;

      if (activeSubFilter !== 'all') {
        if (activeSubFilter === 'under999' && p.price >= 999) return false;
        if (
          activeSubFilter !== 'under999' &&
          p.filter !== activeSubFilter &&
          p.subCategory !== activeSubFilter
        )
          return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.store.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.filter && p.filter.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [products, activeCategory, activeSubFilter, searchQuery, showWishlistOnly, wishlist]);

  // ADMIN FILTERED PRODUCTS
  const adminFilteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
        p.store.toLowerCase().includes(adminSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(adminSearch.toLowerCase());
      const matchCat = adminCatFilter === 'all' || p.category === adminCatFilter;
      return matchSearch && matchCat;
    });
  }, [products, adminSearch, adminCatFilter]);

  const giftStores = [
    { name: 'Ferns N Petals', desc: 'Personalized gifts, curated hampers & same-day delivery across India.', link: 'https://www.fnp.com', badge: 'Popular' },
    { name: 'IGP (Indian Gifts Portal)', desc: 'Custom apparel, luxury chocolates, personalized hampers.', link: 'https://www.igp.com', badge: 'Top Rated' },
    { name: 'Amazon Gift Central', desc: 'Gift cards, fashion combos, smart lifestyle essentials.', link: 'https://www.amazon.in', badge: 'Prime' },
    { name: 'Archies Online', desc: 'Youth gifts, special combos & holiday celebrations.', link: 'https://www.archiesonline.com', badge: 'Special' },
  ];

  const isStoreAdmin = currentUser && currentUser.role === 'admin';

  // =========================================================================
  // VIEW 1: FULL-PAGE EXECUTIVE ADMIN DASHBOARD (Accessible ONLY by Admin)
  // =========================================================================
  if (currentView === 'admin' && isStoreAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-[#F5F5F0] flex font-sans selection:bg-[#C6FF3D] selection:text-black">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-64 sm:w-72 bg-[#0E0E12] border-r border-white/10 flex flex-col justify-between select-none shrink-0 min-h-screen sticky top-0 h-screen">
          <div>
            {/* Header Brand */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C6FF3D] text-black font-black flex items-center justify-center text-lg shadow-lg shadow-[#C6FF3D]/25">
                  NQ
                </div>
                <div>
                  <div className="font-display text-2xl text-white tracking-wider">NOVIQUE</div>
                  <p className="text-[10px] uppercase tracking-widest text-[#C6FF3D] font-bold">Store Admin Suite</p>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" title="System Live" />
            </div>

            {/* Quick Switch to Storefront Button */}
            <div className="p-4 border-b border-white/5">
              <button
                onClick={() => setCurrentView('store')}
                className="w-full bg-white/5 hover:bg-[#C6FF3D] hover:text-black text-gray-300 font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <span>🛍️</span> Switch to Storefront
              </button>
            </div>

            {/* Admin Nav Tabs */}
            <nav className="p-4 space-y-1.5">
              {[
                { id: 'overview', label: 'Executive Dashboard', icon: '📊' },
                { id: 'products', label: `Catalog Manager (${products.length})`, icon: '👕' },
                { id: 'add', label: 'Add New Product', icon: '➕' },
                { id: 'analytics', label: 'Click & Traffic Analytics', icon: '📈' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdminTab(item.id);
                    if (item.id === 'analytics') fetchStats();
                    if (item.id === 'products') setEditingProduct(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider text-left
                    ${adminTab === item.id
                      ? 'bg-[#C6FF3D] text-black shadow-md shadow-[#C6FF3D]/20 font-extrabold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Footer Auth Info */}
          <div className="p-4 border-t border-white/10 bg-white/[0.01]">
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white/5 border border-amber-400/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-black font-extrabold flex items-center justify-center text-xs">
                GM
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">Gaurav Mishra</p>
                <p className="text-[10px] text-[#C6FF3D] font-bold truncate">Store Owner (Admin)</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-center text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider py-2 rounded-lg hover:bg-red-500/10 transition-all"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN WORKSPACE */}
        <main className="flex-1 overflow-y-auto min-h-screen p-6 sm:p-10">
          <div className="space-y-8 animate-fadeIn">

            {/* TAB 1: EXECUTIVE OVERVIEW */}
            {adminTab === 'overview' && (
              <div className="space-y-8">
                {/* Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C6FF3D]/10 text-[#C6FF3D] text-[11px] font-bold uppercase tracking-widest mb-2">
                      <span className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-ping" />
                      Novique Control Suite
                    </div>
                    <h1 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-wide">
                      Welcome, Gaurav Mishra
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Live metrics and outbound affiliate performance for Novique.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdminTab('add')}
                      className="bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C6FF3D]/20"
                    >
                      ➕ Add New Drop
                    </button>
                    <button
                      onClick={() => setCurrentView('store')}
                      className="bg-white/5 hover:bg-white/10 text-white font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all border border-white/10"
                    >
                      View Storefront ↗
                    </button>
                  </div>
                </div>

                {/* Top 4 KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-[#121217] border border-white/10 rounded-3xl p-6">
                    <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2">Total Products</div>
                    <div className="font-display text-5xl text-white mb-1">{products.length}</div>
                    <p className="text-green-400 text-xs font-bold">
                      {products.filter((p) => p.active).length} Live on Storefront
                    </p>
                  </div>

                  <div className="bg-[#121217] border border-white/10 rounded-3xl p-6">
                    <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2">Outbound Clicks</div>
                    <div className="font-display text-5xl text-[#C6FF3D] mb-1">{adminStats ? adminStats.total : 0}</div>
                    <p className="text-gray-400 text-xs">Shoppers sent to partner stores</p>
                  </div>

                  <div className="bg-[#121217] border border-white/10 rounded-3xl p-6">
                    <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2">Today's Traffic</div>
                    <div className="font-display text-5xl text-white mb-1">{adminStats ? adminStats.today : 0}</div>
                    <p className="text-gray-400 text-xs">{adminStats ? adminStats.thisMonth : 0} clicks this month</p>
                  </div>

                  <div className="bg-[#121217] border border-white/10 rounded-3xl p-6">
                    <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2">Est. Gross Pipeline</div>
                    <div className="font-display text-5xl text-green-400 mb-1">
                      ₹{Math.round((adminStats ? adminStats.total : 0) * 37.5).toLocaleString()}
                    </div>
                    <p className="text-gray-400 text-xs">At ~5% average commission</p>
                  </div>
                </div>

                {/* Partner Breakdown & Category Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-7 bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8">
                    <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-1">
                      Partner Store Traffic Share
                    </h3>
                    <p className="text-gray-400 text-xs mb-6">Where your customers are being redirected</p>

                    {adminStats && Object.keys(adminStats.storeBreakdown || {}).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(adminStats.storeBreakdown).map(([store, count]) => {
                          const pct = adminStats.total > 0 ? Math.round((count / adminStats.total) * 100) : 0;
                          return (
                            <div key={store} className="bg-white/5 p-4 rounded-2xl">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="font-bold text-white">{store}</span>
                                <span className="text-[#C6FF3D] font-bold text-xs">{count} clicks ({pct}%)</span>
                              </div>
                              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#C6FF3D] rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs py-8 text-center uppercase tracking-wider">
                        No click events logged yet.
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-5 bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-1">
                        Catalog Breakdown
                      </h3>
                      <p className="text-gray-400 text-xs mb-6">Distribution across apparel departments</p>

                      <div className="space-y-3">
                        {[
                          { label: "Men's Collection", count: products.filter((p) => p.category === 'men').length, icon: '👕' },
                          { label: "Women's Collection", count: products.filter((p) => p.category === 'women').length, icon: '✨' },
                          { label: "Kids' Collection", count: products.filter((p) => p.category === 'kids').length, icon: '🌟' },
                          { label: "Hoodies & Jackets", count: products.filter((p) => p.subCategory === 'hoodie').length, icon: '🧥' },
                        ].map((c) => (
                          <div key={c.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <span className="text-sm font-semibold text-white flex items-center gap-2">
                              <span>{c.icon}</span> {c.label}
                            </span>
                            <span className="font-display text-lg text-[#C6FF3D]">{c.count} items</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setAdminTab('products')}
                      className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
                    >
                      Manage Full Catalog →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CATALOG MANAGER */}
            {adminTab === 'products' && (
              <div className="space-y-6">
                {editingProduct ? (
                  /* Edit Product Form View */
                  <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <h2 className="font-display text-3xl text-white uppercase">Edit Product Details</h2>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="text-xs text-gray-400 hover:text-white uppercase font-bold"
                      >
                        ✕ Close Form
                      </button>
                    </div>

                    <form onSubmit={handleUpdateProduct} className="space-y-4 max-w-2xl">
                      <div>
                        <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Product Title</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C6FF3D]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Selling Price (₹)</label>
                          <input
                            type="number"
                            required
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Original Price (₹)</label>
                          <input
                            type="number"
                            value={editingProduct.originalPrice || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: parseInt(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Image URL</label>
                        <input
                          type="url"
                          required
                          value={editingProduct.image}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Affiliate Destination Link</label>
                        <input
                          type="url"
                          required
                          value={editingProduct.affiliateLink}
                          onChange={(e) => setEditingProduct({ ...editingProduct, affiliateLink: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          className="bg-[#C6FF3D] text-black font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider"
                        >
                          Save Changes 💾
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="bg-white/10 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* Products Table */
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                      <div>
                        <h1 className="font-display text-4xl text-white uppercase tracking-wide">
                          Catalog Manager ({products.length})
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                          Click 'Live / Hidden' to toggle visibility on storefront instantly.
                        </p>
                      </div>

                      <button
                        onClick={() => setAdminTab('add')}
                        className="bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C6FF3D]/20 self-start sm:self-auto"
                      >
                        ➕ Add New Drop
                      </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 bg-[#121217] p-4 rounded-2xl border border-white/10">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white max-w-xs focus:outline-none focus:border-[#C6FF3D]"
                      />
                      <select
                        value={adminCatFilter}
                        onChange={(e) => setAdminCatFilter(e.target.value)}
                        className="bg-[#181820] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      >
                        <option value="all">All Departments</option>
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="kids">Kids</option>
                      </select>
                    </div>

                    {/* Table */}
                    <div className="bg-[#121217] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 uppercase tracking-wider font-semibold">
                            <th className="py-4 px-5">Product</th>
                            <th className="py-4 px-4">Category</th>
                            <th className="py-4 px-4">Price</th>
                            <th className="py-4 px-4">Store</th>
                            <th className="py-4 px-4 text-center">Storefront Status</th>
                            <th className="py-4 px-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {adminFilteredProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-12 h-14 object-cover rounded-xl border border-white/10 bg-black"
                                  />
                                  <div>
                                    <p className="text-white font-semibold text-sm">{p.name}</p>
                                    <p className="text-gray-500 font-mono text-[10px]">{p.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 capitalize text-gray-300 font-medium">
                                {p.category} ({p.subCategory})
                              </td>
                              <td className="py-4 px-4 text-[#C6FF3D] font-bold text-sm">
                                ₹{p.price.toLocaleString()}
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-white/10 text-gray-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                                  {p.store}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <button
                                  onClick={() => toggleProductActive(p)}
                                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                                    p.active
                                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                      : 'bg-gray-500/20 text-gray-500 border border-gray-500/30'
                                  }`}
                                  title="Click to toggle live status"
                                >
                                  {p.active ? '● Live' : '○ Hidden'}
                                </button>
                              </td>
                              <td className="py-4 px-5 text-right space-x-2">
                                <a
                                  href={p.affiliateLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-gray-400 hover:text-[#C6FF3D]"
                                  title="Test Link"
                                >
                                  ↗ Link
                                </a>
                                <button
                                  onClick={() => setEditingProduct(p)}
                                  className="bg-white/5 hover:bg-white/10 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] uppercase"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteProduct(p.id)}
                                  disabled={deletingId === p.id}
                                  className="text-red-400 hover:text-red-300 font-bold px-2 py-1 text-[11px] uppercase disabled:opacity-50"
                                >
                                  {deletingId === p.id ? '...' : 'Del'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ADD NEW PRODUCT BUILDER */}
            {adminTab === 'add' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div>
                    <h1 className="font-display text-4xl text-white uppercase tracking-wide">
                      Add New Drop to Novique
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Publish instantly to your customer storefront.</p>
                  </div>
                  <button
                    onClick={() => setAdminTab('products')}
                    className="text-gray-400 hover:text-white text-xs uppercase font-bold"
                  >
                    ← Back to Catalog
                  </button>
                </div>

                <form onSubmit={handleAddProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-8 bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                    <div>
                      <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="e.g. Novique Heavyweight Oversized Tee"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6FF3D]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Department *</label>
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="w-full bg-[#181820] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                        >
                          <option value="men">Men's Wear</option>
                          <option value="women">Women's Wear</option>
                          <option value="kids">Kids' Drip</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Type *</label>
                        <select
                          value={newProduct.subCategory}
                          onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                          className="w-full bg-[#181820] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                        >
                          <option value="tshirt">T-Shirt</option>
                          <option value="hoodie">Hoodie / Pullover</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Fit Style</label>
                        <select
                          value={newProduct.filter}
                          onChange={(e) => setNewProduct({ ...newProduct, filter: e.target.value })}
                          className="w-full bg-[#181820] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                        >
                          <option value="graphic">Graphic</option>
                          <option value="oversized">Oversized</option>
                          <option value="plain">Plain</option>
                          <option value="polo">Polo</option>
                          <option value="zipper">Zipper</option>
                          <option value="pullover">Pullover</option>
                          <option value="crop">Crop Top</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Sale Price (₹) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          placeholder="599"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6FF3D]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Original MRP (₹)</label>
                        <input
                          type="number"
                          min="1"
                          value={newProduct.originalPrice}
                          onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                          placeholder="1299"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Partner Store *</label>
                        <select
                          value={newProduct.store}
                          onChange={(e) => setNewProduct({ ...newProduct, store: e.target.value })}
                          className="w-full bg-[#181820] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                        >
                          <option value="Amazon">Amazon</option>
                          <option value="Myntra">Myntra</option>
                          <option value="Flipkart">Flipkart</option>
                          <option value="Ajio">Ajio</option>
                          <option value="Bewakoof">Bewakoof</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Image URL *</label>
                      <input
                        type="url"
                        required
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6FF3D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Affiliate Destination Link *</label>
                      <input
                        type="url"
                        required
                        value={newProduct.affiliateLink}
                        onChange={(e) => setNewProduct({ ...newProduct, affiliateLink: e.target.value })}
                        placeholder="https://www.amazon.in/dp/.../?tag=novique-21"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6FF3D]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-extrabold py-4 rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-[#C6FF3D]/20 transition-all"
                    >
                      Publish Drop to Storefront ⚡
                    </button>
                  </div>

                  {/* Preview on Right */}
                  <div className="lg:col-span-4 bg-[#121217] border border-white/10 rounded-3xl p-6 sticky top-6">
                    <p className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-4">Live Preview</p>
                    <div className="bg-[#181820] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                      <div className="aspect-[4/5] bg-black relative flex items-center justify-center">
                        {newProduct.image ? (
                          <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-gray-600 text-xs">Image preview appears here</div>
                        )}
                      </div>
                      <div className="p-4 space-y-1">
                        <p className="text-white font-bold text-sm truncate">{newProduct.name || 'Sample Drop Title'}</p>
                        <p className="text-[#C6FF3D] font-bold text-base">₹{newProduct.price || 0}</p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 4: CLICK & TRAFFIC ANALYTICS */}
            {adminTab === 'analytics' && (
              <div className="space-y-8">
                <div className="pb-6 border-b border-white/10">
                  <h1 className="font-display text-4xl text-white uppercase tracking-wide">
                    Click &amp; Traffic Analytics
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">Real-time outbound referral logs</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-[#121217] border border-white/10 rounded-3xl p-6">
                    <div className="text-xs uppercase font-bold text-gray-400 mb-1">Total Referrals</div>
                    <div className="font-display text-4xl text-[#C6FF3D]">{adminStats ? adminStats.total : 0}</div>
                  </div>
                  <div className="bg-[#121217] border border-white/10 rounded-3xl p-6">
                    <div className="text-xs uppercase font-bold text-gray-400 mb-1">Today's Traffic</div>
                    <div className="font-display text-4xl text-white">{adminStats ? adminStats.today : 0}</div>
                  </div>
                  <div className="bg-[#121217] border border-white/10 rounded-3xl p-6">
                    <div className="text-xs uppercase font-bold text-gray-400 mb-1">This Month</div>
                    <div className="font-display text-4xl text-[#FF3D81]">{adminStats ? adminStats.thisMonth : 0}</div>
                  </div>
                </div>

                {/* Recent Click Table */}
                <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8">
                  <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-4">
                    Live Click Audit Stream
                  </h3>
                  {adminStats && adminStats.recent && adminStats.recent.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-gray-400 uppercase font-semibold">
                            <th className="pb-3">Product Name</th>
                            <th className="pb-3">Partner Store</th>
                            <th className="pb-3">Destination Link</th>
                            <th className="pb-3 text-right">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {adminStats.recent.map((c) => (
                            <tr key={c.id}>
                              <td className="py-3 text-white font-medium">{c.productName}</td>
                              <td className="py-3">
                                <span className="bg-white/10 text-gray-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  {c.store}
                                </span>
                              </td>
                              <td className="py-3 font-mono text-gray-400 text-[11px] truncate max-w-xs">{c.affiliateLink}</td>
                              <td className="py-3 text-right text-gray-400 font-mono">
                                {new Date(c.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs text-center py-6">No clicks logged yet.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: CUSTOMER STOREFRONT VIEW (Dynamic Role-based)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F5F5F0] selection:bg-[#C6FF3D] selection:text-black font-sans">
      
      {/* TOP TICKER BAR */}
      <div className="bg-[#C6FF3D] text-black font-extrabold text-[11px] sm:text-xs py-2 overflow-hidden uppercase tracking-widest sticky top-0 z-50">
        <div className="animate-marquee whitespace-nowrap flex gap-12 font-black">
          <span>🔥 NOVIQUE WINTER DROPS 2026</span>
          <span>•</span>
          <span>⚡ HOODIE SEASON IS LIVE</span>
          <span>•</span>
          <span>📦 HAND-PICKED FROM AMAZON, MYNTRA &amp; FLIPKART</span>
          <span>•</span>
          <span>🎁 GIFT STORE CURATIONS NOW AVAILABLE</span>
          <span>•</span>
          <span>🔥 LIMITED RUN DESIGNS</span>
          <span>•</span>
          <span>⚡ STREETWEAR CULTURE</span>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-[#0A0A0C]/90 backdrop-blur-md sticky top-[32px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <button
            onClick={() => {
              setActiveCategory('all');
              setActiveSubFilter('all');
              setShowWishlistOnly(false);
              setSearchQuery('');
            }}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C6FF3D] text-black font-black flex items-center justify-center text-xl tracking-tighter shadow-lg shadow-[#C6FF3D]/20 group-hover:scale-105 transition-transform">
              NQ
            </div>
            <div>
              <span className="font-display text-2xl sm:text-3xl tracking-wider text-white group-hover:text-[#C6FF3D] transition-colors">
                NOVIQUE
              </span>
              <span className="block text-[9px] uppercase tracking-[0.25em] text-gray-400">
                Streetwear Curated
              </span>
            </div>
          </button>

          {/* Navigation Tabs */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            {[
              { id: 'all', label: '⚡ All Drops' },
              { id: 'men', label: 'Men' },
              { id: 'women', label: 'Women' },
              { id: 'kids', label: 'Kids' },
              { id: 'hoodie', label: '🧥 Hoodies' },
              { id: 'gifts', label: '🎁 Gifts' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id);
                  setActiveSubFilter('all');
                  setShowWishlistOnly(false);
                }}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeCategory === tab.id && !showWishlistOnly
                    ? 'bg-[#C6FF3D] text-black shadow-md shadow-[#C6FF3D]/20'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Action Icons (Search, Wishlist, Account & Conditional Admin Suite) */}
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-40 md:w-56">
              <input
                type="text"
                placeholder="Search tees, hoodies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => setShowWishlistOnly(!showWishlistOnly)}
              className={`p-2.5 rounded-full border transition-all flex items-center gap-1.5 ${
                showWishlistOnly
                  ? 'bg-[#FF3D81] text-white border-[#FF3D81]'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/30'
              }`}
              title="Saved Wishlist"
            >
              <span>❤️</span>
              {wishlist.length > 0 && <span className="text-xs font-bold">{wishlist.length}</span>}
            </button>

            {/* CONDITIONAL STORE ADMIN BUTTON (SHOWN ONLY TO GAURAV/ADMIN) */}
            {isStoreAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className="bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-black px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C6FF3D]/25 flex items-center gap-1.5 animate-pulse"
                title="You are logged in as Store Owner. Click to enter Admin Suite."
              >
                <span>⚙️</span>
                <span>Admin Suite</span>
              </button>
            )}

            {/* USER PROFILE AVATAR & DROPDOWN MENU */}
            <div className="relative">
              {currentUser ? (
                <>
                  {/* Purple User Silhouette Avatar Button (Matches User Screenshot) */}
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED]/30 to-[#4C1D95]/40 hover:from-[#7C3AED]/50 hover:to-[#4C1D95]/60 border border-[#8B5CF6]/50 flex items-center justify-center transition-all duration-200 cursor-pointer relative shadow-lg shadow-[#7C3AED]/20 active:scale-95"
                    title={isStoreAdmin ? 'Store Owner Account (Click for options)' : 'My Account (Click for options)'}
                  >
                    {/* Purple Silhouette SVG Icon */}
                    <svg className="w-5 h-5 text-[#A78BFA]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                    </svg>

                    {/* Admin Crown/Green Dot Badge */}
                    {isStoreAdmin && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#C6FF3D] border-2 border-[#0A0A0C] rounded-full flex items-center justify-center text-[8px] font-black text-black" title="Store Owner">
                        ★
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      {/* Backdrop to close on click outside */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />

                      <div className="absolute right-0 top-12 w-72 bg-[#121217] border border-white/15 rounded-2xl shadow-2xl z-50 p-4 space-y-4 animate-fade-in backdrop-blur-xl">
                        {/* Profile Header */}
                        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] border border-[#8B5CF6] flex items-center justify-center shrink-0 shadow-md">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                            </svg>
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-white font-bold text-sm truncate">
                              {currentUser.name || 'Gaurav Mishra'}
                            </p>
                            <p className="text-gray-400 text-xs truncate">
                              {currentUser.email}
                            </p>
                            {isStoreAdmin ? (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#C6FF3D]/15 text-[#C6FF3D] border border-[#C6FF3D]/30 text-[10px] font-extrabold uppercase tracking-wider">
                                👑 Store Administrator
                              </span>
                            ) : (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/10 text-gray-300 text-[10px] font-bold">
                                🛍️ Novique Member
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Menu Actions */}
                        <div className="space-y-1 text-xs">
                          {/* If Admin: Direct Admin Suite Switch */}
                          {isStoreAdmin && (
                            <button
                              onClick={() => {
                                setCurrentView('admin');
                                setShowUserMenu(false);
                              }}
                              className="w-full bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-black py-2.5 px-3 rounded-xl uppercase tracking-wider text-[11px] transition-all flex items-center justify-between shadow-md shadow-[#C6FF3D]/20 mb-2"
                            >
                              <span className="flex items-center gap-2">
                                <span>⚙️</span> Open Admin Suite
                              </span>
                              <span>→</span>
                            </button>
                          )}

                          {/* Wishlist Shortcut */}
                          <button
                            onClick={() => {
                              setShowWishlistOnly(true);
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left py-2 px-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white flex items-center justify-between transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <span>❤️</span> My Saved Drops
                            </span>
                            <span className="text-gray-500 font-bold">{wishlist.length}</span>
                          </button>
                        </div>

                        {/* Sign Out Action */}
                        <div className="pt-2 border-t border-white/10">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left py-2 px-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 font-bold text-xs flex items-center gap-2 transition-colors"
                          >
                            <span>🚪</span> Log Out / Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all cursor-pointer group"
                  title="Sign In to Novique"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                  </svg>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex lg:hidden overflow-x-auto px-4 py-2.5 gap-2 border-t border-white/5 scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'men', label: 'Men' },
            { id: 'women', label: 'Women' },
            { id: 'kids', label: 'Kids' },
            { id: 'hoodie', label: '🧥 Hoodies' },
            { id: 'gifts', label: '🎁 Gifts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                setActiveSubFilter('all');
                setShowWishlistOnly(false);
              }}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeCategory === tab.id && !showWishlistOnly
                  ? 'bg-[#C6FF3D] text-black'
                  : 'bg-white/5 text-gray-300 border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* HERO SECTION */}
      {activeCategory !== 'gifts' && !showWishlistOnly && (
        <section className="relative overflow-hidden hero-gradient border-b border-white/10 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#C6FF3D] text-xs font-bold uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-ping" />
                Novique Streetwear 2026
              </div>

              <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white uppercase leading-[0.9] mb-6">
                WEAR THE <br />
                <span className="text-[#C6FF3D] drop-shadow-[0_0_35px_rgba(198,255,61,0.3)]">
                  DROP.
                </span>
              </h1>

              <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Hand-picked streetwear, oversized tees &amp; premium winter hoodies. Curated from India's top stores into one seamless destination.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => { setActiveCategory('hoodie'); setActiveSubFilter('all'); }}
                  className="bg-[#C6FF3D] text-black font-extrabold px-8 py-4 rounded-full text-xs uppercase tracking-widest hover:bg-[#d8ff6b] hover:scale-105 transition-all shadow-xl shadow-[#C6FF3D]/25"
                >
                  Shop Hoodies 🧥
                </button>
                <button
                  onClick={() => { setActiveCategory('all'); setActiveSubFilter('oversized'); }}
                  className="bg-white/10 text-white font-extrabold px-8 py-4 rounded-full text-xs uppercase tracking-widest border border-white/20 hover:bg-white/20 hover:scale-105 transition-all"
                >
                  Oversized Fits ⚡
                </button>
              </div>
            </div>

            {/* Right Mockup */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-72 sm:w-80 h-96">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col justify-between shadow-2xl animate-float">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#FF3D81] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                      LIMITED DROP
                    </span>
                    <span className="text-2xl">🧥</span>
                  </div>
                  <div className="py-6 text-center">
                    <div className="w-36 h-36 mx-auto rounded-2xl bg-[#0A0A0C] border border-white/10 flex items-center justify-center text-4xl">
                      👕
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-white uppercase tracking-wider">Heavyweight Street Hoodie</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[#C6FF3D] font-bold text-lg">₹1,299</span>
                      <span className="text-gray-400 text-xs line-through">₹2,499</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MAIN CATALOG GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeCategory !== 'gifts' && (
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-bold mr-2">Filter By:</span>
              {[
                { id: 'all', label: 'All Styles' },
                { id: 'graphic', label: 'Graphic Tees' },
                { id: 'oversized', label: 'Oversized' },
                { id: 'plain', label: 'Essential Plain' },
                { id: 'polo', label: 'Polos' },
                { id: 'zipper', label: 'Zip-Up' },
                { id: 'pullover', label: 'Pullover' },
                { id: 'under999', label: '🏷️ Under ₹999' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubFilter(sub.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    activeSubFilter === sub.id
                      ? 'bg-[#C6FF3D] text-black'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-400 font-medium">
              Showing <span className="text-[#C6FF3D] font-bold">{filteredProducts.length}</span> pieces
            </div>
          </div>
        )}

        {/* GIFTS VIEW */}
        {activeCategory === 'gifts' && (
          <div className="py-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-5xl block mb-4">🎁</span>
              <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-wider mb-4">
                GIFTS THEY'LL ACTUALLY LOVE
              </h2>
              <p className="text-gray-400 text-sm">
                Need a surprise for a birthday, anniversary, or celebration? Partnered with India's best gifting platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {giftStores.map((store, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-[#C6FF3D] transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">🎀</span>
                      <span className="bg-[#C6FF3D]/20 text-[#C6FF3D] text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                        {store.badge}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#C6FF3D] transition-colors">{store.name}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-6">{store.desc}</p>
                  </div>
                  <a
                    href={store.link}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="w-full text-center bg-white/10 hover:bg-[#C6FF3D] hover:text-black text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
                  >
                    Explore Gift Ideas ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS CARDS */}
        {activeCategory !== 'gifts' && (
          <div>
            {loading ? (
              <div className="text-center py-24 text-gray-500">
                <div className="w-12 h-12 border-2 border-[#C6FF3D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-xs uppercase tracking-widest">Loading fresh drops...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl p-8">
                <span className="text-4xl block mb-4">🔍</span>
                <h3 className="font-display text-2xl text-white uppercase mb-2">No Matching Drops Found</h3>
                <button
                  onClick={() => { setActiveSubFilter('all'); setActiveCategory('all'); setShowWishlistOnly(false); setSearchQuery(''); }}
                  className="bg-[#C6FF3D] text-black font-extrabold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider mt-4"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((p) => {
                  const discount = p.originalPrice
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : 0;
                  const isSaved = wishlist.includes(p.id);

                  return (
                    <div
                      key={p.id}
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#C6FF3D] transition-all group flex flex-col justify-between relative shadow-lg"
                    >
                      <div className="relative aspect-[4/5] bg-black/40 overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />

                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                          {p.trending && (
                            <span className="bg-[#FF3D81] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider shadow">
                              🔥 Trending
                            </span>
                          )}
                          {discount > 0 && (
                            <span className="bg-[#C6FF3D] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider shadow">
                              -{discount}%
                            </span>
                          )}
                        </div>

                        <div className="absolute top-3 right-3 z-10">
                          <span className="bg-black/75 backdrop-blur-md text-gray-300 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-white/10">
                            {p.store}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-xs hover:scale-110 transition-transform z-10"
                        >
                          {isSaved ? '❤️' : '🤍'}
                        </button>
                      </div>

                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                            {p.category} • {p.subCategory}
                          </p>
                          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[#C6FF3D] transition-colors mb-3">
                            {p.name}
                          </h3>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-white font-black text-lg">
                              ₹{p.price.toLocaleString()}
                            </span>
                            {p.originalPrice && (
                              <span className="text-gray-500 text-xs line-through">
                                ₹{p.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <a
                            href={`/go/${p.id}`}
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            className="w-full block text-center bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-[#C6FF3D]/10"
                          >
                            Buy on {p.store} ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#08080A] mt-24 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="font-display text-3xl text-[#C6FF3D] tracking-wider mb-3">NOVIQUE</div>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-4">
              Your one-stop streetwear curation engine. Hand-picked T-shirts &amp; hoodies from premier partner stores.
            </p>
            <p className="text-gray-500 text-xs leading-relaxed">
              Affiliate Disclosure: When you click our links and purchase from our store partners, we may earn an affiliate commission at zero additional cost to you.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><button onClick={() => { setActiveCategory('men'); setActiveSubFilter('all'); }} className="hover:text-[#C6FF3D]">Men's Collection</button></li>
              <li><button onClick={() => { setActiveCategory('women'); setActiveSubFilter('all'); }} className="hover:text-[#C6FF3D]">Women's Collection</button></li>
              <li><button onClick={() => { setActiveCategory('kids'); setActiveSubFilter('all'); }} className="hover:text-[#C6FF3D]">Kids' Drip</button></li>
              <li><button onClick={() => setActiveCategory('gifts')} className="hover:text-[#C6FF3D]">Gifting Solutions 🎁</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Account &amp; Store</h4>
            <div className="space-y-3">
              {currentUser ? (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Signed in as: <strong className="text-white">{currentUser.name || currentUser.email}</strong></p>
                  {isStoreAdmin && (
                    <button
                      onClick={() => setCurrentView('admin')}
                      className="bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 mb-2"
                    >
                      <span>⚙️</span> Open Admin Suite
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-xs text-red-400 hover:underline block font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-white/5 hover:bg-[#C6FF3D] hover:text-black text-gray-300 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center gap-2"
                >
                  <span>👤</span> Sign In to Account
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 mt-12 pt-6 text-center text-xs text-gray-600">
          © 2026 NOVIQUE. Built as an All-in-One Unified Application.
        </div>
      </footer>

      {/* AUTHENTICATION MODAL (Dual Mode: Sign In & Sign Up + Social Login) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121217] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowAuthModal(false);
                setAuthError('');
                setAuthSuccess('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            {/* Header Brand */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-[#C6FF3D] text-black font-black flex items-center justify-center text-xl shadow-lg shadow-[#C6FF3D]/25">
                NQ
              </div>
              <h3 className="font-display text-3xl text-white uppercase tracking-wider mb-1">
                {authMode === 'signin' ? 'Welcome Back' : 'Join Novique'}
              </h3>
              <p className="text-gray-400 text-xs">
                {authMode === 'signin'
                  ? 'Sign in to access your saved drops & account'
                  : 'Create your free account to unlock exclusive drops'}
              </p>
            </div>

            {/* Mode Switcher Tabs (Sign In vs Sign Up) */}
            <div className="grid grid-cols-2 bg-white/5 p-1 rounded-2xl border border-white/10 mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  authMode === 'signin'
                    ? 'bg-[#C6FF3D] text-black shadow-lg shadow-[#C6FF3D]/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  authMode === 'signup'
                    ? 'bg-[#C6FF3D] text-black shadow-lg shadow-[#C6FF3D]/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Social Logins: Google, Facebook, Discord */}
            <div className="mb-5">
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 text-center mb-3">
                Instant Social Connect
              </p>
              <div className="grid grid-cols-3 gap-2">
                {/* Google Button */}
                <button
                  type="button"
                  disabled={socialLoading !== null}
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                  title="Sign in with Google"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                {/* Facebook Button */}
                <button
                  type="button"
                  disabled={socialLoading !== null}
                  onClick={() => handleSocialLogin('facebook')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/40 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                  title="Sign in with Facebook"
                >
                  <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </button>

                {/* Discord Button */}
                <button
                  type="button"
                  disabled={socialLoading !== null}
                  onClick={() => handleSocialLogin('discord')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/40 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                  title="Sign in with Discord"
                >
                  <svg className="w-4 h-4 fill-[#5865F2] shrink-0" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  <span>Discord</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#121217] px-3 text-[10px] uppercase font-bold tracking-widest text-gray-500 shrink-0">
                Or With Email
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            {/* Error & Success Messages */}
            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-xs">
                ⚠️ {authError}
              </div>
            )}
            {authSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4 text-green-400 text-xs">
                ✅ {authSuccess}
              </div>
            )}

            {/* TAB 1: SIGN IN FORM */}
            {authMode === 'signin' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs uppercase font-bold tracking-wider text-gray-400">
                      Password
                    </label>
                  </div>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C6FF3D]/20 disabled:opacity-50 mt-2"
                >
                  {authLoading ? 'Signing In...' : 'Sign In to Novique →'}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-gray-400">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="text-[#C6FF3D] font-bold hover:underline"
                    >
                      Create Account (Sign Up)
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* TAB 2: SIGN UP FORM (With Email Verification Code / OTP) */}
            {authMode === 'signup' && (
              <>
                {/* STEP 2A: Details Form -> Sends Verification Code */}
                {signupStep === 'form' && (
                  <form onSubmit={handleSendOTP} className="space-y-3.5">
                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Rahul Verma"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                        Email Address (Verification Code will be sent here)
                      </label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                          Confirm
                        </label>
                        <input
                          type="password"
                          required
                          value={authConfirmPassword}
                          onChange={(e) => setAuthConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C6FF3D]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C6FF3D]/20 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                    >
                      {authLoading ? 'Sending Verification Code...' : 'Send Verification Code ✉️'}
                    </button>

                    <div className="text-center pt-2">
                      <p className="text-xs text-gray-400">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('signin');
                            setAuthError('');
                            setAuthSuccess('');
                          }}
                          className="text-[#C6FF3D] font-bold hover:underline"
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  </form>
                )}

                {/* STEP 2B: 6-Digit OTP Verification Screen */}
                {signupStep === 'otp' && (
                  <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fade-in text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 flex items-center justify-center text-2xl text-[#C6FF3D]">
                      ✉️
                    </div>

                    <div>
                      <h4 className="text-white font-display text-xl uppercase tracking-wider">
                        Enter 6-Digit Code
                      </h4>
                      <p className="text-gray-400 text-xs mt-1">
                        We sent a code to <strong className="text-white">{authEmail}</strong>
                      </p>
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        autoFocus
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full bg-white/5 border border-white/20 rounded-2xl py-3.5 text-center font-mono text-3xl tracking-[0.5em] text-[#C6FF3D] placeholder-gray-600 focus:outline-none focus:border-[#C6FF3D]"
                      />
                      <p className="text-[11px] text-gray-500 mt-2">
                        Enter the code received in your inbox
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading || otpCode.length !== 6}
                      className="w-full bg-[#C6FF3D] hover:bg-[#d8ff6b] text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C6FF3D]/20 disabled:opacity-50"
                    >
                      {authLoading ? 'Verifying Code...' : 'Verify & Activate Account ✅'}
                    </button>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2 px-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSignupStep('form');
                          setAuthError('');
                        }}
                        className="hover:text-white underline text-[11px]"
                      >
                        ← Change Email
                      </button>
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={authLoading}
                        className="text-[#C6FF3D] hover:underline font-bold text-[11px]"
                      >
                        Resend Code 🔄
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            <div className="mt-5 pt-4 border-t border-white/5 text-center text-[11px] text-gray-500 leading-relaxed">
              Store owners unlock the <strong>Admin Suite</strong> automatically upon signing in.
            </div>
          </div>
        </div>
      )}

      {/* GIFT MODAL */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#FF3D81] rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => {
                setShowGiftModal(false);
                localStorage.setItem('novique_gift_dismissed', 'true');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
            >
              ✕
            </button>
            <div className="text-center">
              <span className="text-5xl block mb-3">🎁</span>
              <h3 className="font-display text-3xl text-white uppercase mb-2">Gifting Someone?</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Explore curated gift hampers, cards &amp; special combo sets from verified partner shops.
              </p>
              <button
                onClick={() => {
                  setShowGiftModal(false);
                  setActiveCategory('gifts');
                  localStorage.setItem('novique_gift_dismissed', 'true');
                }}
                className="w-full bg-[#FF3D81] text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider mb-3 shadow-lg shadow-[#FF3D81]/30"
              >
                View Curated Gift Stores →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
