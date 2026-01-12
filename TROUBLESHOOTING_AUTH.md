# Troubleshooting Google OAuth "no_code" Error

## Current Issue
The callback is being hit but without the `code` parameter, resulting in `no_code` error.

## Step-by-Step Debugging

### 1. Check Browser URL During Login
When you click "Sign in with Google":
1. You should be redirected to Google
2. After Google login, check the URL you're redirected to
3. Look for `?code=...` in the URL

### 2. Verify Supabase Redirect URL Configuration

**Critical:** Go to Supabase Dashboard → Authentication → URL Configuration

**Site URL should be:**
```
http://localhost:5001
```

**Redirect URLs should include:**
```
http://localhost:5001/auth/callback
https://cursor-course-8pwlcxlp2-alex100395s-projects.vercel.app/auth/callback
```

**Important:** Make sure these are EXACTLY as shown above (no trailing slashes, correct protocol)

### 3. Check Google OAuth Settings

In Google Cloud Console → Credentials → Your OAuth Client:

**Authorized redirect URIs should have:**
```
https://xalevmbgzsoclkxosaup.supabase.co/auth/v1/callback
```

**NOT:**
- `http://localhost:5001/auth/callback` (this goes in Supabase, not Google)
- Your Vercel URL (this goes in Supabase, not Google)

### 4. Check Terminal Logs

After clicking login, check your terminal. You should see:
```
Callback URL: http://localhost:5001/auth/callback?code=...
Query params: { code: '...', ... }
```

If you see the callback URL but no `code` parameter, Supabase isn't passing it.

### 5. Verify Supabase Google Provider Settings

Go to Supabase Dashboard → Authentication → Providers → Google:

- ✅ "Enable Sign in with Google" toggle should be ON
- ✅ Client IDs field should have: `993360061052-k476ijsj132c8rtgcco6lcplnqr2tqdc.apps.googleusercontent.com`
- ✅ Client Secret should be filled in
- ✅ Callback URL should show: `https://xalevmbgzsoclkxosaup.supabase.co/auth/v1/callback`

### 6. Test the Flow Manually

1. Open browser console (F12)
2. Click "Sign in with Google"
3. Watch the network tab for redirects
4. Check what URL you land on after Google login
5. Share the URL (you can redact sensitive parts)

## Common Fixes

### Fix 1: Add Redirect URL to Supabase
If you haven't added `http://localhost:5001/auth/callback` to Supabase Redirect URLs, do that now.

### Fix 2: Clear Browser Cache
Sometimes cached redirects cause issues:
- Clear browser cache
- Try incognito/private window
- Try a different browser

### Fix 3: Check OAuth Consent Screen
In Google Cloud Console → OAuth consent screen:
- Make sure your email is added as a test user
- If in testing mode, only test users can sign in

### Fix 4: Restart Dev Server
After making changes:
```bash
# Stop server (Ctrl+C)
yarn dev
```

## What to Check Next

1. **Check terminal logs** - What does the callback URL show?
2. **Check browser URL** - What URL do you see after Google login?
3. **Verify Supabase settings** - Are redirect URLs added correctly?

Share what you see in the terminal logs when you try to log in, and we can debug further!
