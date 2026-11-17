import { NextResponse } from 'next/server';
import { getProductById } from '@/lib/products';
import { logClick } from '@/lib/clicks';

export async function GET(request, context) {
  const params = await context.params;
  const { slug } = params;
  const product = getProductById(slug);

  if (!product || !product.affiliateLink) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Log the click
  try {
    logClick(product.id, product.name, product.store, product.affiliateLink);
  } catch (e) {
    console.error('Click log error:', e);
  }

  // Redirect to affiliate link
  return NextResponse.redirect(product.affiliateLink, { status: 302 });
}
