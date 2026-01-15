import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // DIRECT approach: Get session and set state immediately
    const initSession = async () => {
      try {
        // Try Supabase first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('❌ Error getting session:', error);
          }
          
          if (session) {
            console.log('✅ Session found via Supabase:', session.user?.email);
            setSession(session);
            setUser(session.user);
            setLoading(false);
            return;
          }
          
          // If Supabase returns no session, check localStorage directly as fallback
          if (typeof window !== 'undefined') {
            const storageKey = Object.keys(localStorage).find(key => 
              key.startsWith('sb-') && key.includes('auth-token')
            );
            
            if (storageKey) {
              console.log('🔍 Found auth token in localStorage, forcing session refresh...');
              try {
                // Force Supabase to re-read from storage
                const { data: { session: retrySession } } = await supabase.auth.getSession();
                if (retrySession && mounted) {
                  console.log('✅ Session found on retry:', retrySession.user?.email);
                  setSession(retrySession);
                  setUser(retrySession.user);
                  setLoading(false);
                  return;
                }
              } catch (retryErr) {
                console.error('❌ Error on retry:', retryErr);
              }
            }
          }
          
          // If no session found, set to null
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ Error in initSession:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Get session immediately
    initSession();

    // Check multiple times (production can be slow)
    const timeouts = [
      setTimeout(() => mounted && initSession(), 500),
      setTimeout(() => mounted && initSession(), 1500),
      setTimeout(() => mounted && initSession(), 3000),
    ];

    // Listen for auth changes - this is the PRIMARY way to detect sessions
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user');
      
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // If we have a session but user metadata is missing, refresh the user
        if (session?.user && (!session.user.user_metadata || Object.keys(session.user.user_metadata).length === 0)) {
          supabase.auth.getUser().then(({ data: { user: refreshedUser } }) => {
            if (refreshedUser && mounted) {
              console.log('✅ User metadata refreshed');
              setUser(refreshedUser);
            }
          }).catch(err => {
            console.error('❌ Error refreshing user:', err);
          });
        }
      }
    });

    // Also listen for storage changes (in case session is saved in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.includes('supabase') || e.key.includes('sb-'))) {
        console.log('🔄 Storage changed, checking session...');
        initSession();
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      mounted = false;
      timeouts.forEach(clearTimeout);
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
    // Note: signInWithOAuth redirects automatically, so we don't need to handle the response
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!(user || session?.user),
  };
}
