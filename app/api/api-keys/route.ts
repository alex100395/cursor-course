import { NextRequest, NextResponse } from 'next/server';
import { getAllApiKeys, createApiKey } from './store';

// GET - List all API keys
export async function GET() {
  try {
    const apiKeys = await getAllApiKeys();
    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error('Error fetching API keys from Supabase:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, key } = body;

    if (!name || !key) {
      return NextResponse.json(
        { error: 'Name and API key are required' },
        { status: 400 }
      );
    }

    const newApiKey = await createApiKey(name, key);
    return NextResponse.json(newApiKey, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

