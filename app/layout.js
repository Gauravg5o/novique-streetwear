import './globals.css';

export const metadata = {
  title: {
    default: 'Novique — Wear The Drop',
    template: '%s | Novique',
  },
  description: 'Novique — Curated Streetwear, T-Shirts & Hoodies.',
  keywords: ['Novique', 'tshirts', 'hoodies', 'streetwear', 'fashion', 'youth fashion', 'graphic tees'],
  openGraph: {
    type: 'website',
    title: 'Novique — Wear The Drop',
    description: 'Novique — Curated Streetwear, T-Shirts & Hoodies.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
