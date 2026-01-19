'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('📍 Auth callback page loaded');
        console.log('   Current URL:', window.location.href);
        console.log('   Hash:', window.location.hash.substring(0, 50) + '...');
        console.log('   Search:', window.location.search);
        
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        console.log('   Has access_token:', !!accessToken);
        console.log('   Has refresh_token:', !!refreshToken);
        console.log('   Has error:', !!error);

        if (error) {
          console.error('OAuth error:', error, errorDescription);
          router.push(`/?error=auth_failed&reason=${encodeURIComponent(errorDescription || error)}`);
          return;
        }

        if (accessToken && refreshToken) {
          console.log('🔑 Found access_token and refresh_token in URL hash');
          // Set the session using the tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('❌ Error setting session:', sessionError);
            router.push(`/?error=auth_failed&reason=${encodeURIComponent(sessionError.message)}`);
            return;
          }

          if (data.session && data.user) {
            console.log('✅ Session set successfully:', data.user.email);
            if (data.session.expires_at) {
              console.log('   Session expires at:', new Date(data.session.expires_at * 1000).toLocaleString());
            }
            
            // Create or update user profile in database
            try {
              const upsertResponse = await fetch('/api/users/upsert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
                  image: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
                }),
              });
              if (upsertResponse.ok) {
                console.log('✅ User profile created/updated');
              } else {
                console.warn('⚠️ User profile upsert failed:', upsertResponse.status);
              }
            } catch (error) {
              console.error('❌ Error creating/updating user profile:', error);
              // Continue even if user profile creation fails
            }
            
            // Wait longer to ensure session is saved to localStorage
            console.log('⏳ Waiting for session to persist...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Verify session was saved before redirecting
            const { data: { session: verifySession }, error: verifyError } = await supabase.auth.getSession();
            if (verifyError) {
              console.error('❌ Error verifying session:', verifyError);
            } else if (!verifySession) {
              console.warn('⚠️ Session not found after setting, waiting longer...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              // Check one more time
              const { data: { session: finalCheck } } = await supabase.auth.getSession();
              if (finalCheck) {
                console.log('✅ Session found on final check');
              } else {
                console.error('❌ Session still not found after retry');
              }
            } else {
              console.log('✅ Session verified before redirect');
            }
            
            // Use window.location for full page reload to ensure session is read
            console.log('🔄 Redirecting to home page...');
            window.location.href = '/dashboard';
            return;
          }
        }

        // If we have a code parameter (query string), handle it server-side
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
          // Exchange code for session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('Error exchanging code:', exchangeError);
            router.push(`/?error=auth_failed&reason=${encodeURIComponent(exchangeError.message)}`);
            return;
          }

          if (data.session && data.user) {
            console.log('✅ Session exchanged successfully:', data.user.email);
            if (data.session.expires_at) {
              console.log('   Session expires at:', new Date(data.session.expires_at * 1000).toLocaleString());
            }
            
            // Create or update user profile in database
            try {
              const upsertResponse = await fetch('/api/users/upsert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
                  image: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
                }),
              });
              if (upsertResponse.ok) {
                console.log('✅ User profile created/updated');
              } else {
                console.warn('⚠️ User profile upsert failed:', upsertResponse.status);
              }
            } catch (error) {
              console.error('❌ Error creating/updating user profile:', error);
              // Continue even if user profile creation fails
            }
            
            // Wait longer to ensure session is saved to localStorage
            console.log('⏳ Waiting for session to persist...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Verify session was saved before redirecting
            const { data: { session: verifySession }, error: verifyError } = await supabase.auth.getSession();
            if (verifyError) {
              console.error('❌ Error verifying session:', verifyError);
            } else if (!verifySession) {
              console.warn('⚠️ Session not found after exchange, waiting longer...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              // Check one more time
              const { data: { session: finalCheck } } = await supabase.auth.getSession();
              if (finalCheck) {
                console.log('✅ Session found on final check');
              } else {
                console.error('❌ Session still not found after retry');
              }
            } else {
              console.log('✅ Session verified before redirect');
            }
            
            // Use window.location for full page reload to ensure session is read
            console.log('🔄 Redirecting to home page...');
            window.location.href = '/dashboard';
            return;
          }
        }

        // If no tokens or code, something went wrong
        console.error('No tokens or code found in callback');
        router.push('/?error=auth_failed&reason=no_tokens');
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.push('/?error=auth_failed&reason=callback_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-zinc-600 dark:text-zinc-400">Completing sign in...</p>
      </div>
    </div>
  );
}
