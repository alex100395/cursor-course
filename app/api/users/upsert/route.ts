import { NextRequest, NextResponse } from 'next/server';
import { upsertUser } from '../../../../lib/usersService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, image } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: email' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: name' },
        { status: 400 }
      );
    }

    // Validate image if provided (optional)
    if (image !== undefined && image !== null && (typeof image !== 'string' || image.trim() === '')) {
      return NextResponse.json(
        { error: 'Invalid field: image must be a valid string or null' },
        { status: 400 }
      );
    }

    const user = await upsertUser(id, email.trim(), name.trim(), image?.trim() || null);

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error('Error upserting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upsert user' },
      { status: 500 }
    );
  }
}
