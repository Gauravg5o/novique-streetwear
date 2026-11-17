import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductGrid from '../../components/ProductGrid';
import GiftPopup from '../../components/GiftPopup';
import { getProductsByCategory } from '../../lib/products';

export const metadata = {
  title: "Kids' T-Shirts & Hoodies",
  description: "Shop cool kids T-shirts and hoodies. For boys, girls, age 2-5 and 6-12.",
};

const filters = [
  { label: 'T-Shirts', value: 'tshirt' },
  { label: 'Hoodies', value: 'hoodie' },
  { label: 'Boys', value: 'boys' },
  { label: 'Girls', value: 'girls' },
  { label: 'Age 2–5', value: 'age-2-5' },
  { label: 'Age 6–12', value: 'age-6-12' },
];

export default function KidsPage() {
  const products = getProductsByCategory('kids');

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="bg-brand-gray border-b border-brand-gray-2 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-brand-gold uppercase tracking-[0.3em] text-sm mb-3">Collection</p>
            <h1 className="font-display text-6xl md:text-8xl text-white uppercase">Kids'</h1>
            <p className="text-gray-400 mt-3 max-w-md">
              Mini drip, maximum energy. Graphic tees and cozy hoodies for young trendsetters.
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
      <GiftPopup section="kids" />
      <Footer />
    </>
  );
}
