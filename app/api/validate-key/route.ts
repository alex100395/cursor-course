import { NextRequest, NextResponse } from 'next/server';
import { getAllApiKeys, createApiKey, updateApiKey, deleteApiKey, validateApiKey } from './store';

// GET - List all API keys OR validate a single API key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKeyToValidate = searchParams.get('key');

    // If 'key' query parameter is provided, validate the key
    if (apiKeyToValidate) {
      console.log('GET /api/validate-key - Validating API key');
      const isValid = await validateApiKey(apiKeyToValidate);
      return NextResponse.json({ valid: isValid });
    }

    // Otherwise, return all API keys
    console.log('GET /api/validate-key - Fetching API keys');
    console.log('Service role key available:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
    
    const apiKeys = await getAllApiKeys();
    console.log('Successfully fetched', apiKeys.length, 'API keys');
    return NextResponse.json(apiKeys);
  } catch (error: any) {
    console.error('❌ Error in GET /api/validate-key:');
    console.error('   Error type:', error?.constructor?.name);
    console.error('   Error message:', error?.message);
    console.error('   Error code:', error?.code);
    console.error('   Error details:', error?.details);
    console.error('   Error hint:', error?.hint);
    console.error('   Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to process request',
        details: error?.details || error?.hint || 'Check server console for more details',
        code: error?.code,
        type: error?.constructor?.name,
      },
      { status: 500 }
    );
  }
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  try {
    // Log environment variable status
    console.log('API Route - SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
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
  } catch (error: any) {
    console.error('API Route - Error creating API key:', error);
    console.error('API Route - Error details:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    
    // Return more detailed error information
    const errorMessage = error?.message || 'Failed to create API key';
    const errorDetails = error?.details || error?.hint || '';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        code: error?.code,
      },
      { status: 500 }
    );
  }
}

// PUT - Update an API key
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, key } = body;

    if (!id || !name || !key) {
      return NextResponse.json(
        { error: 'ID, name, and API key are required' },
        { status: 400 }
      );
    }

    const updatedApiKey = await updateApiKey(id, { name, key });
    if (!updatedApiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedApiKey);
  } catch (error: any) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update API key' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an API key
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await deleteApiKey(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete API key' },
      { status: 500 }
    );
  }
}

