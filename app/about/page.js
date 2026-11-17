import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = { title: 'About Us' };

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="bg-brand-gray border-b border-brand-gray-2 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-brand-gold uppercase tracking-[0.3em] text-sm mb-3">Our Story</p>
            <h1 className="font-display text-6xl md:text-8xl text-white uppercase">About</h1>
          </div>
        </section>
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="gold-line" />
          <h2 className="font-display text-4xl text-white mb-6 uppercase">Novique Streetwear</h2>
          <div className="prose prose-invert max-w-none text-gray-400 space-y-4">
            <p>Novique is a curated streetwear platform engineered for modern youth fashion, oversized silhouettes, and premium winter essentials.</p>
            <p>We curate the best T-shirts and Hoodies from top stores across India and globally. We're not just a clothing site — we're a destination for those who want standout drip without scrolling through thousands of mediocre listings.</p>
            <p>When you click on a product and buy through our links, you get the exact same price (or lower) directly on the merchant's store — and we earn a small affiliate commission. It's how we keep this platform free, clean, and growing.</p>
            <p>Thank you for being part of the Novique community.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
