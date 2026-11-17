import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductGrid from '../../components/ProductGrid';
import GiftPopup from '../../components/GiftPopup';
import { getProductsByCategory } from '../../lib/products';

export const metadata = {
  title: "Women's T-Shirts & Hoodies",
  description: "Shop premium women's T-shirts and hoodies. Crop tops, oversized, graphic tees, zip-up and pullover hoodies.",
};

const filters = [
  { label: 'T-Shirts', value: 'tshirt' },
  { label: 'Hoodies', value: 'hoodie' },
  { label: 'Crop', value: 'crop' },
  { label: 'Oversized', value: 'oversized' },
  { label: 'Graphic', value: 'graphic' },
  { label: 'Plain', value: 'plain' },
  { label: 'Zipper', value: 'zipper' },
];

export default function WomenPage() {
  const products = getProductsByCategory('women');

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="bg-brand-gray border-b border-brand-gray-2 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-brand-gold uppercase tracking-[0.3em] text-sm mb-3">Collection</p>
            <h1 className="font-display text-6xl md:text-8xl text-white uppercase">Women's</h1>
            <p className="text-gray-400 mt-3 max-w-md">
              Bold fits for driven women. Crop tops, oversized tees, graphic prints &amp; premium hoodies.
            </p>
          </div>
        </section>
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400 text-sm">{products.length} products</p>
          </div>
          <ProductGrid products={products} filters={filters} />
        </section>
      </main>
      <GiftPopup section="women" />
      <Footer />
    </>
  );
}
