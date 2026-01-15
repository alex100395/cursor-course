import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Get the authenticated user from a Next.js API request
 * Returns the user ID if authenticated, null otherwise
 */
export async function getUserFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }

    // Create a Supabase client with cookie support
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      },
    });

    // Try to get session from Authorization header first (most reliable)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        console.log('User found from Authorization header:', user.id);
        return user.id;
      }
    }

    // Try to get user from session stored in cookies
    // Supabase stores session in cookies with pattern: sb-<project-ref>-auth-token
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      // Extract the access token from cookies
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      // Look for Supabase auth token cookie
      const authTokenKey = Object.keys(cookies).find(key => 
        key.includes('auth-token') || key.includes('access-token')
      );

      if (authTokenKey) {
        const token = cookies[authTokenKey];
        if (token) {
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (!error && user) {
            console.log('User found from cookie:', user.id);
            return user.id;
          }
        }
      }

      // Try to get session directly (Supabase might handle cookies automatically)
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session?.user) {
        console.log('User found from session:', session.user.id);
        return session.user.id;
      }
    }

    console.log('No user found in request');
    return null;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}
