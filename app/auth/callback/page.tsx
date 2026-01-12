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

          if (data.session) {
            // Success! Redirect to home
            router.push('/');
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

          if (data.session) {
            router.push('/');
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
