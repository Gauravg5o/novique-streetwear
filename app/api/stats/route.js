import { NextResponse } from 'next/server';
import { getClickStats } from '@/lib/clicks';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const stats = getClickStats();
  return NextResponse.json(stats);
}
