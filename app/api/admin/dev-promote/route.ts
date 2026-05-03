import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'Not available in production' }, { status: 403 });
  }

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // MOCK RESPONSE for Dev Environment
    return NextResponse.json({
      message: 'Admin promotion request simulated. Please relogin to refresh claims (Note: In real dev, use Keycloak Console)'
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
