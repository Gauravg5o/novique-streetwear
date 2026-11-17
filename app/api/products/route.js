import { NextResponse } from 'next/server';
import { getAllProducts, addProduct } from '@/lib/products';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const products = getAllProducts();
  return NextResponse.json(products);
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const product = {
      id: body.id || `${body.category}-${body.subCategory}-${Date.now()}`,
      name: body.name,
      category: body.category,
      subCategory: body.subCategory,
      filter: body.filter || body.subCategory,
      price: parseInt(body.price),
      originalPrice: body.originalPrice ? parseInt(body.originalPrice) : null,
      image: body.image || 'https://placehold.co/400x500/1A1A1A/C9A84C?text=PRODUCT',
      affiliateLink: body.affiliateLink,
      store: body.store,
      featured: body.featured || false,
      trending: body.trending || false,
      active: body.active !== false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    addProduct(product);
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
