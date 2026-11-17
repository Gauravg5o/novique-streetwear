# Novique — Wear The Drop ⚡

**Novique** is a modern, high-performance streetwear & hoodie affiliate e-commerce platform and executive management suite built with Next.js 16, Tailwind CSS, and Jose JWT.

---

## 🚀 Key Features

* **Single Page Storefront:** Seamless real-time in-page filtering for Men, Women, Kids, Hoodies, and Gifts.
* **Affiliate Link Redirection:** Click logging and referral redirects to partner stores (Amazon, Myntra, Flipkart, Ajio, Bewakoof).
* **Dual-Role Authentication:**
  * **Customer Registration with 6-Digit Email OTP:** Real email verification flow prevents unauthorized/fake signups.
  * **Social Connect:** Instant login support for Google, Facebook, and Discord.
  * **Private Executive Admin Suite:** Automatically reveals for verified Store Administrators (`Gauravmishra5621@gmail.com`). 100% hidden from normal visitors.
* **Executive Dashboard:**
  * Live KPI Overview (Catalog count, active drops, referral clicks).
  * Catalog Manager with active/inactive toggles & quick deletion.
  * Add New Drop with live interactive mobile card preview.
  * Real-time Click & Traffic Analytics audit log stream.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 16 (App Router, Turbopack)
* **Styling:** Tailwind CSS with custom neon streetwear design system
* **Authentication:** JOSE JWT (`HS256`) + HttpOnly Secure Cookies
* **Email & OTP:** Nodemailer with 6-digit verification code system
* **Database:** JSON-based persistent flat-file data store (`data/products.json`, `data/users.json`, `data/clicks.json`)

---

## 📦 Getting Started

1. Clone repository:
   ```bash
   git clone https://github.com/Gauravg5o/novique-streetwear.git
   cd novique-streetwear
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env.local
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) or [http://localhost:3001](http://localhost:3001) in your browser.

---

© 2026 Novique. Curated Streetwear. All rights reserved.
