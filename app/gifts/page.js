import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Gift Stores',
  description: 'Find the perfect gift — curated gift stores for men, women, and kids.',
};

const giftStores = [
  { name: 'Store A — Coming Soon', desc: 'Gift cards, premium sets, and curated collections.', link: '#', budget: 'All Budgets', forWhom: 'Everyone' },
  { name: 'Store B — Coming Soon', desc: 'Personalized gifts and hampers.', link: '#', budget: '₹500–₹5000', forWhom: 'Him & Her' },
  { name: 'Store C — Coming Soon', desc: 'Fun, quirky gifts for all ages.', link: '#', budget: '₹200–₹2000', forWhom: 'Kids' },
];

export default function GiftsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="bg-brand-gray border-b border-brand-gray-2 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-5xl mb-4">🎁</div>
            <p className="text-brand-gold uppercase tracking-[0.3em] text-sm mb-3">Gift Stores</p>
            <h1 className="font-display text-6xl md:text-8xl text-white uppercase">Gifts</h1>
            <p className="text-gray-400 mt-3 max-w-md">
              Curated gift stores for every budget and every person. We may earn a commission on qualifying purchases.
            </p>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="gold-line" />
            <h2 className="font-display text-4xl text-white uppercase">Our Gift Partners</h2>
            <p className="text-gray-400 mt-2 text-sm">
              We're in the process of verifying and joining gift affiliate programmes. Check back soon!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {giftStores.map((store, i) => (
              <div key={i} className="bg-brand-gray border border-brand-gray-2 hover:border-brand-gold transition-all duration-300 p-6 rounded-lg">
                <div className="text-3xl mb-4">🎀</div>
                <h3 className="text-white font-bold text-lg mb-2">{store.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{store.desc}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-brand-gray-2 text-gray-300 text-xs px-3 py-1 rounded-full">{store.budget}</span>
                  <span className="bg-brand-gray-2 text-gray-300 text-xs px-3 py-1 rounded-full">For: {store.forWhom}</span>
                </div>
                <a
                  href={store.link}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="btn-outline w-full text-center block text-xs py-3"
                >
                  Visit Store →
                </a>
              </div>
            ))}
          </div>

          <p className="text-gray-600 text-xs text-center mt-10">
            We may earn a commission when you buy through our links, at no extra cost to you.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
