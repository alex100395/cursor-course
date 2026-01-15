import { createClient } from '@supabase/supabase-js';
import https from 'https';

// Handle SSL certificate issues in corporate networks
// ⚠️ Only for development - in production, fix your SSL certificates properly
if (process.env.NODE_ENV === 'development' && !process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  // Set Node.js to accept self-signed certificates (development only)
  // This must be set before any HTTPS connections are made
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key for server-side operations (bypasses RLS)
// Fall back to anon key if service role key is not set
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

// Verify service role key by checking JWT payload (only in development)
if (process.env.NODE_ENV === 'development') {
  const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log('🔑 Supabase Server Client Initialized:');
  console.log('   - URL:', supabaseUrl);
  console.log('   - Using Service Role Key:', usingServiceRole);
  console.log('   - SSL Certificate Validation: Disabled (development mode)');
  
  if (usingServiceRole && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Decode JWT to verify it's a service role key
    try {
      const payload = JSON.parse(Buffer.from(process.env.SUPABASE_SERVICE_ROLE_KEY.split('.')[1], 'base64').toString());
      console.log('   - JWT Role:', payload.role);
      if (payload.role !== 'service_role') {
        console.warn('   ⚠️  WARNING: Key does not have service_role!');
      } else {
        console.log('   ✅ Service role key verified - RLS will be bypassed');
      }
    } catch (e) {
      console.warn('   ⚠️  Could not verify JWT payload');
    }
  } else {
    console.warn('   ⚠️  Using ANON_KEY - RLS policies will apply!');
  }
}

export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

