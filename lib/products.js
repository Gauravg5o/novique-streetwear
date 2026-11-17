import initialProducts from '@/data/products.json';

let productsMemory = Array.isArray(initialProducts) ? [...initialProducts] : [];

function getFsData() {
  try {
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      const fs = require('fs');
      const path = require('path');
      const DATA_PATH = path.join(process.cwd(), 'data', 'products.json');
      if (fs.existsSync(DATA_PATH)) {
        const raw = fs.readFileSync(DATA_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          productsMemory = parsed;
          return parsed;
        }
      }
    }
  } catch {
    // Edge runtime / Cloudflare Worker doesn't have Node filesystem
  }
  return productsMemory;
}

function saveFsData(products) {
  productsMemory = products;
  try {
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      const fs = require('fs');
      const path = require('path');
      const DATA_PATH = path.join(process.cwd(), 'data', 'products.json');
      fs.writeFileSync(DATA_PATH, JSON.stringify(products, null, 2));
    }
  } catch {
    // Edge runtime
  }
}

export function getAllProducts() {
  return getFsData();
}

export function getProductsByCategory(category) {
  return getAllProducts().filter(
    (p) => p.category === category && p.active
  );
}

export function getProductById(id) {
  return getAllProducts().find((p) => p.id === id);
}

export function saveProducts(products) {
  saveFsData(products);
}

export function addProduct(product) {
  const products = getAllProducts();
  products.unshift(product);
  saveProducts(products);
  return product;
}

export function updateProduct(id, updates) {
  const products = getAllProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates };
  saveProducts(products);
  return products[idx];
}

export function deleteProduct(id) {
  const products = getAllProducts();
  const filtered = products.filter((p) => p.id !== id);
  saveProducts(filtered);
}

export function getFeaturedProducts() {
  return getAllProducts().filter((p) => p.featured && p.active);
}

export function getTrendingProducts() {
  return getAllProducts().filter((p) => p.trending && p.active);
}
