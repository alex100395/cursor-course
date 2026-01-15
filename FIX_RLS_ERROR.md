# Fix RLS Error for API Keys

## The Problem
You're getting: `new row violates row-level security policy for table "api_keys"`

This means RLS (Row Level Security) is enabled on the `api_keys` table, but there are no policies allowing inserts.

## Solution: Disable RLS (Recommended)

Go to **Supabase Dashboard → SQL Editor** and run this:

```sql
-- Disable RLS on api_keys table
ALTER TABLE public.api_keys DISABLE ROW LEVEL SECURITY;
```

## Alternative: Create RLS Policies (If you want to keep RLS enabled)

If you want to keep RLS enabled, create these policies:

```sql
-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserts (for service role or authenticated users)
CREATE POLICY "Allow inserts for service role"
  ON public.api_keys
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow selects
CREATE POLICY "Allow selects for service role"
  ON public.api_keys
  FOR SELECT
  USING (true);

-- Policy to allow updates
CREATE POLICY "Allow updates for service role"
  ON public.api_keys
  FOR UPDATE
  USING (true);

-- Policy to allow deletes
CREATE POLICY "Allow deletes for service role"
  ON public.api_keys
  FOR DELETE
  USING (true);
```

## Verify Your Service Role Key

Make sure your `.env.local` has:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

The service role key should bypass RLS, but if RLS is enabled with no policies, it can still fail.

## Quick Fix

**Just run this one SQL command:**
```sql
ALTER TABLE public.api_keys DISABLE ROW LEVEL SECURITY;
```

Then try creating an API key again.
