import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product }) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card rounded-lg overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-[4/5] bg-brand-gray-2 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.trending && (
            <span className="bg-brand-red text-white text-[10px] font-bold uppercase px-2 py-1 tracking-wider">
              Trending
            </span>
          )}
          {discount > 0 && (
            <span className="bg-brand-gold text-brand-black text-[10px] font-bold uppercase px-2 py-1 tracking-wider">
              -{discount}%
            </span>
          )}
        </div>
        {/* Store badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-brand-black/80 text-gray-300 text-[10px] uppercase px-2 py-1 tracking-wider">
            {product.store}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-brand-gold font-bold text-lg">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-gray-500 text-sm line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        <a
          href={`/go/${product.id}`}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="btn-gold w-full text-center block text-xs py-3"
        >
          Buy on {product.store} →
        </a>
        <p className="text-gray-600 text-[10px] text-center mt-2">
          We may earn a commission
        </p>
      </div>
    </div>
  );
}
