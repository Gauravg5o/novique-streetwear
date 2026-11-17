import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'products.json');

export function getAllProducts() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
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
  fs.writeFileSync(DATA_PATH, JSON.stringify(products, null, 2));
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
