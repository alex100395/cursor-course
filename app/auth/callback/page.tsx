'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (error) {
          console.error('OAuth error:', error, errorDescription);
          router.push(`/?error=auth_failed&reason=${encodeURIComponent(errorDescription || error)}`);
          return;
        }

        if (accessToken && refreshToken) {
          // Set the session using the tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Error setting session:', sessionError);
            router.push(`/?error=auth_failed&reason=${encodeURIComponent(sessionError.message)}`);
            return;
          }

          if (data.session && data.user) {
            // Create or update user profile in database
            try {
              await fetch('/api/users/upsert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
                  image: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
                }),
              });
            } catch (error) {
              console.error('Error creating/updating user profile:', error);
              // Continue even if user profile creation fails
            }
            
            // Verify session is saved by checking it again
            const { data: { session: verifiedSession } } = await supabase.auth.getSession();
            if (verifiedSession) {
              console.log('✅ Session verified, redirecting...', verifiedSession.user.email);
              // Double-check localStorage has the session
              const storedSession = localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`);
              console.log('Session in localStorage:', !!storedSession);
            } else {
              console.warn('⚠️ Session not found after setting, retrying...');
              // Retry setting the session (only if we still have tokens)
              if (accessToken && refreshToken) {
                const { data: retryData, error: retryError } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });
                if (retryError) {
                  console.error('Retry session error:', retryError);
                } else if (retryData.session) {
                  console.log('✅ Session set on retry');
                }
              }
            }
            
            // Wait longer to ensure session is persisted, especially in production
            const waitTime = window.location.hostname === 'localhost' ? 1000 : 2000;
            console.log(`Waiting ${waitTime}ms before redirect...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // Final verification
            const { data: { session: finalSession } } = await supabase.auth.getSession();
            console.log('Final session check before redirect:', finalSession ? '✅ Found' : '❌ Not found');
            
            // Use window.location for full page reload to ensure session is read
            window.location.href = '/';
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
            // Create or update user profile in database
            try {
              await fetch('/api/users/upsert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
                  image: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
                }),
              });
            } catch (error) {
              console.error('Error creating/updating user profile:', error);
              // Continue even if user profile creation fails
            }
            
            // Verify session is saved by checking it again
            const { data: { session: verifiedSession } } = await supabase.auth.getSession();
            if (verifiedSession) {
              console.log('✅ Session verified after code exchange, redirecting...', verifiedSession.user.email);
            } else {
              console.warn('⚠️ Session not found after exchangeCodeForSession');
              // For code exchange, we can't retry easily, so just log the warning
            }
            
            // Wait longer to ensure session is persisted, especially in production
            const waitTime = window.location.hostname === 'localhost' ? 1000 : 2000;
            console.log(`Waiting ${waitTime}ms before redirect...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // Final verification
            const { data: { session: finalSession } } = await supabase.auth.getSession();
            console.log('Final session check before redirect:', finalSession ? '✅ Found' : '❌ Not found');
            
            // Use window.location for full page reload to ensure session is read
            window.location.href = '/';
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
