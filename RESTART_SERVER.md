# How to Restart Server and Clear Cache

## Steps to Fix "Changes Not Reflecting"

### 1. Stop the Development Server
- Press `Ctrl+C` in the terminal where the server is running
- Make sure it's completely stopped

### 2. Clear Next.js Cache
Run these commands in PowerShell:

```powershell
cd my-app
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

### 3. Restart the Server
```powershell
yarn dev
```

### 4. Clear Browser Cache
- Press `Ctrl+Shift+Delete` in your browser
- Or use Hard Refresh: `Ctrl+F5` or `Ctrl+Shift+R`

### 5. Check Database Changes
Make sure you've run these SQL commands in Supabase:

```sql
-- Add user_id column (if not exists)
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Disable RLS (since we're using service role key)
ALTER TABLE public.api_keys DISABLE ROW LEVEL SECURITY;
```

### 6. Verify Environment Variables
Check that `.env.local` has:
- `SUPABASE_SERVICE_ROLE_KEY` (required for bypassing RLS)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 7. Check Server Logs
After restarting, check the terminal logs when you try to create an API key. You should see:
- "Creating API key for user: ..."
- "Using Supabase client with service role key: true"
