'use client';

export default function CheckEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Environment Variables Check</h1>
      
      <div className="space-y-2">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{' '}
          {supabaseUrl ? (
            <span className="text-green-600">✅ Set ({supabaseUrl.substring(0, 30)}...)</span>
          ) : (
            <span className="text-red-600">❌ MISSING</span>
          )}
        </div>
        
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{' '}
          {supabaseKey ? (
            <span className="text-green-600">✅ Set ({supabaseKey.substring(0, 20)}...)</span>
          ) : (
            <span className="text-red-600">❌ MISSING</span>
          )}
        </div>
      </div>

      {(!supabaseUrl || !supabaseKey) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded">
          <h2 className="font-bold text-red-800 dark:text-red-200">⚠️ Environment Variables Missing!</h2>
          <p className="text-red-700 dark:text-red-300 mt-2">
            Go to Vercel Dashboard → Your Project → Settings → Environment Variables
            <br />
            Make sure these are set for <strong>Production</strong> environment.
          </p>
        </div>
      )}
    </div>
  );
}
