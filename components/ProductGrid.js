'use client';
import { useState } from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, filters }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = activeFilter === 'all'
    ? products
    : products.filter((p) => p.filter === activeFilter || p.subCategory === activeFilter);

  return (
    <div>
      {/* Filters */}
      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-medium border transition-all duration-200
              ${activeFilter === 'all'
                ? 'bg-brand-gold text-brand-black border-brand-gold'
                : 'border-brand-gray-3 text-gray-400 hover:border-brand-gold hover:text-brand-gold'}`}
          >
            All
          </button>
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-medium border transition-all duration-200
                ${activeFilter === f.value
                  ? 'bg-brand-gold text-brand-black border-brand-gold'
                  : 'border-brand-gray-3 text-gray-400 hover:border-brand-gold hover:text-brand-gold'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No products found.</p>
          <p className="text-sm mt-2">Check back soon — new drops incoming.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
