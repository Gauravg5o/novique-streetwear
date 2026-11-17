import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = { title: 'Affiliate Disclosure' };

export default function DisclosurePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="bg-brand-gray border-b border-brand-gray-2 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-5xl text-white uppercase">Affiliate Disclosure</h1>
          </div>
        </section>
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-gray-400 space-y-6 text-sm leading-relaxed">
            <p className="text-brand-gold font-medium">Last updated: November 17, 2026</p>
            <p>Novique participates in affiliate marketing programmes. This means that when you click on a product link on our website and make a qualifying purchase, we may earn a commission — at no extra cost to you.</p>
            <p>The price you pay at the store is exactly the same as if you had visited the store directly. Our commission is paid by the merchant, not by you.</p>
            <h3 className="text-white font-bold uppercase tracking-wider text-base mt-8">Affiliate Programmes We Use</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Amazon Associates Programme</li>
              <li>Flipkart Affiliate Programme</li>
              <li>Myntra Affiliate Programme</li>
              <li>Ajio Affiliate Programme</li>
              <li>Bewakoof Affiliate Programme</li>
            </ul>
            <p>We only promote products we genuinely believe are good quality and worth your money. Our editorial decisions are not influenced by affiliate relationships.</p>
            <p>If you have questions about this disclosure, contact us.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
