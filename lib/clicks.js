import fs from 'fs';
import path from 'path';

const CLICKS_PATH = path.join(process.cwd(), 'data', 'clicks.json');

export function getAllClicks() {
  try {
    const raw = fs.readFileSync(CLICKS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function logClick(productId, productName, store, affiliateLink) {
  const clicks = getAllClicks();
  clicks.unshift({
    id: Date.now().toString(),
    productId,
    productName,
    store,
    affiliateLink,
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
  });
  // Keep only last 10,000 clicks
  const trimmed = clicks.slice(0, 10000);
  fs.writeFileSync(CLICKS_PATH, JSON.stringify(trimmed, null, 2));
}

export function getClickStats() {
  const clicks = getAllClicks();
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.substring(0, 7);

  const todayClicks = clicks.filter((c) => c.date === today);
  const monthClicks = clicks.filter((c) => c.date?.startsWith(thisMonth));

  // Top products by clicks
  const productMap = {};
  clicks.forEach((c) => {
    productMap[c.productId] = productMap[c.productId] || { name: c.productName, clicks: 0, store: c.store };
    productMap[c.productId].clicks++;
  });
  const topProducts = Object.entries(productMap)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  // Store breakdown
  const storeMap = {};
  clicks.forEach((c) => {
    storeMap[c.store] = (storeMap[c.store] || 0) + 1;
  });

  return {
    total: clicks.length,
    today: todayClicks.length,
    thisMonth: monthClicks.length,
    topProducts,
    storeBreakdown: storeMap,
    recent: clicks.slice(0, 20),
  };
}
