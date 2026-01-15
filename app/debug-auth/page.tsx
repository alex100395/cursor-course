'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function DebugAuth() {
  const [session, setSession] = useState<any>(null);
  const [localStorageKeys, setLocalStorageKeys] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        // Check session
        const { data: { session: s }, error: e } = await supabase.auth.getSession();
        setSession(s);
        if (e) setError(e.message);

        // Check localStorage
        const keys = Object.keys(localStorage).filter(k => 
          k.includes('supabase') || k.includes('sb-')
        );
        setLocalStorageKeys(keys);
      } catch (err: any) {
        setError(err.message);
      }
    };

    check();
    const interval = setInterval(check, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Auth Debug Page</h1>
      
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Session:</h2>
        <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded overflow-auto">
          {session ? JSON.stringify({
            user: session.user?.email,
            expires_at: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : null,
            has_metadata: !!session.user?.user_metadata,
            metadata_keys: session.user?.user_metadata ? Object.keys(session.user.user_metadata) : []
          }, null, 2) : 'No session'}
        </pre>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">LocalStorage Keys:</h2>
        <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded">
          {localStorageKeys.length > 0 ? localStorageKeys.join('\n') : 'No Supabase keys found'}
        </pre>
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      <button
        onClick={async () => {
          const { data: { session: s } } = await supabase.auth.getSession();
          setSession(s);
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh Session
      </button>
    </div>
  );
}
