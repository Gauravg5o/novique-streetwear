import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
