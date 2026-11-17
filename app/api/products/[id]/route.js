import { NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/products';
import { getAdminSession } from '@/lib/auth';

export async function GET(request, context) {
  const params = await context.params;
  const product = getProductById(params.id);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(request, context) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const params = await context.params;
    const body = await request.json();
    const updated = updateProduct(params.id, {
      ...body,
      price: body.price ? parseInt(body.price) : undefined,
      originalPrice: body.originalPrice ? parseInt(body.originalPrice) : undefined,
    });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const params = await context.params;
    deleteProduct(params.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
