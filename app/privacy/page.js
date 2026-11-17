import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="bg-brand-gray border-b border-brand-gray-2 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-5xl text-white uppercase">Privacy Policy</h1>
          </div>
        </section>
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-gray-400 space-y-6 text-sm leading-relaxed">
            <p className="text-brand-gold font-medium">Last updated: November 17, 2026</p>
            <h3 className="text-white font-bold uppercase tracking-wider text-base">What We Collect</h3>
            <p>We collect anonymous click data (which products are clicked and when) to improve our recommendations. We do not collect personal data unless you voluntarily contact us.</p>
            <h3 className="text-white font-bold uppercase tracking-wider text-base mt-6">Analytics</h3>
            <p>We use Google Analytics 4 and Microsoft Clarity to understand how visitors use our site. These tools may set cookies and collect anonymous usage data. You can opt out through your browser settings.</p>
            <h3 className="text-white font-bold uppercase tracking-wider text-base mt-6">Affiliate Links</h3>
            <p>When you click affiliate links and visit partner stores, those stores may collect your data per their own privacy policies. We recommend reviewing each store's privacy policy.</p>
            <h3 className="text-white font-bold uppercase tracking-wider text-base mt-6">Cookies</h3>
            <p>We use localStorage to remember your preferences (e.g., if you've dismissed a popup). We use cookies for analytics purposes.</p>
            <h3 className="text-white font-bold uppercase tracking-wider text-base mt-6">Your Rights</h3>
            <p>You have the right to request deletion of any data we hold about you. Contact us and we will respond within 30 days.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
