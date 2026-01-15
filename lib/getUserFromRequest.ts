import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Get the authenticated user from a Next.js API request
 * Returns the user ID if authenticated, null otherwise
 * 
 * The client should send the access token in the Authorization header
 */
export async function getUserFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    // Try to get session from Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        return user.id;
      }
    }

    // Try to get user from cookies (Supabase stores session in cookies)
    // Get all cookies that might contain the session
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      // Supabase stores the session in a cookie, try to extract and use it
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        return user.id;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}
