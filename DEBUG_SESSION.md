# Debugging Session Issues in Production

## Step 1: Test Production Build Locally

Before deploying, test the production build locally:

```bash
npm run build
npm run start
```

Then test the login flow. This catches many production-only issues.

## Step 2: Check Browser Console After Login

After logging in, open browser console (F12) and look for:

### Expected Logs:
- `Session check: Found user: [your-email]`
- `Session found on retry: [your-email]`

### If You See:
- `Session check: No session` → Session not being saved
- `Error getting session: [error]` → Check error message
- `Found auth token in localStorage, retrying session...` → Session exists but not detected

## Step 3: Check LocalStorage

1. Open DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Local Storage** → Your domain
4. Look for keys starting with:
   - `sb-` (Supabase)
   - `supabase.auth.token`

### What to Check:
- **If keys exist**: Session is saved, but not being read
- **If no keys**: Session is not being saved at all

## Step 4: Check Network Tab

1. Open DevTools → **Network** tab
2. Filter by "Fetch/XHR"
3. After login, check:
   - `/api/users/upsert` - Should return 200
   - `/api/validate-key` - Should include `Authorization` header

## Step 5: Manual Session Check

Open browser console and run:

```javascript
// Check if Supabase client exists
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// Check session directly
const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);

// Check localStorage
console.log('LocalStorage keys:', Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('sb-')));
```

## Step 6: Common Issues & Fixes

### Issue: "No session" but localStorage has tokens
**Fix**: Session might be expired or invalid. Try logging out and back in.

### Issue: Session exists but `isAuthenticated` is false
**Fix**: Check if `user` or `session?.user` is null. The hook checks both.

### Issue: Session works locally but not in production
**Possible causes**:
1. Environment variables not set in production
2. Supabase redirect URLs not configured correctly
3. CORS issues
4. Cookie settings (SameSite, Secure flags)

## Step 7: Verify Supabase Configuration

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Check:
   - **Site URL**: Should match your production domain
   - **Redirect URLs**: Should include your production callback URL

## Step 8: Test in Incognito/Private Window

Sometimes browser extensions or cached data cause issues. Test in a fresh incognito window.
