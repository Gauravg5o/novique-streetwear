import initialClicks from '@/data/clicks.json';

let memoryClicks = Array.isArray(initialClicks) ? [...initialClicks] : [];

function getFsClicks() {
  try {
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      const fs = require('fs');
      const path = require('path');
      const CLICKS_PATH = path.join(process.cwd(), 'data', 'clicks.json');
      if (fs.existsSync(CLICKS_PATH)) {
        const raw = fs.readFileSync(CLICKS_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryClicks = parsed;
          return parsed;
        }
      }
    }
  } catch {
    // Edge runtime
  }
  return memoryClicks;
}

function saveFsClicks(clicks) {
  memoryClicks = clicks;
  try {
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      const fs = require('fs');
      const path = require('path');
      const CLICKS_PATH = path.join(process.cwd(), 'data', 'clicks.json');
      fs.writeFileSync(CLICKS_PATH, JSON.stringify(clicks, null, 2));
    }
  } catch {
    // Edge runtime
  }
}

export function getAllClicks() {
  return getFsClicks();
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
  const trimmed = clicks.slice(0, 10000);
  saveFsClicks(trimmed);
}

export function getClickStats() {
  const clicks = getAllClicks();
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.substring(0, 7);

  const todayClicks = clicks.filter((c) => c.date === today);
  const monthClicks = clicks.filter((c) => c.date?.startsWith(thisMonth));

  const productMap = {};
  clicks.forEach((c) => {
    productMap[c.productId] = productMap[c.productId] || { name: c.productName, clicks: 0, store: c.store };
    productMap[c.productId].clicks++;
  });
  const topProducts = Object.entries(productMap)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

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
