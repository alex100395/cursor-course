# Fixing Google OAuth Redirect URIs

## Current Issues in Your Google Console

1. ❌ **Invalid redirect URI**: `https://www.example.com` (remove this)
2. ❌ **Placeholder Supabase URL**: `https://xxx.supabase.co/auth/v1/callback` (needs your actual URL)
3. ✅ **Production URL**: `https://cursor-course-8pwlcxlp2-alex100395s-projects.vercel.app` (keep this)

## Step 1: Get Your Actual Supabase Redirect URI

### Option A: From Supabase Dashboard (Easiest)

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Providers** → **Google**
4. Look for the **Redirect URL** field - it will show something like:
   ```
   https://abcdefghijklmnop.supabase.co/auth/v1/callback
   ```
5. **Copy this exact URL** - this is what you need!

### Option B: From Your Environment Variables

If you have your Supabase URL in your `.env.local`:
- Your Supabase URL looks like: `https://YOUR_PROJECT_REF.supabase.co`
- Your redirect URI is: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

## Step 2: Fix Google OAuth Console Settings

### In "Authorized JavaScript origins" section:
Keep these (they're correct):
- ✅ `http://localhost:5001` (development)
- ✅ `https://cursor-course-8pwlcxlp2-alex100395s-projects.vercel.app` (production)

### In "Authorized redirect URIs" section:

**Remove:**
- ❌ Delete `https://www.example.com` (click the trash icon - it's causing the error)

**Add/Update:**
1. **Replace** `https://xxx.supabase.co/auth/v1/callback` with your actual Supabase redirect URI:
   - Should be: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Example: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

**Final redirect URIs should have ONLY:**
```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

**Important Notes:**
- You only need ONE redirect URI here (the Supabase one)
- Supabase automatically handles redirecting back to your app (localhost or production)
- The `redirectTo` option in your code (`/auth/callback`) tells Supabase where to send users after auth
- You do NOT need to add `http://localhost:5001/auth/callback` or your Vercel URL here

## Step 3: Verify Your Configuration

After updating:

1. **Click "Save"** in Google Console
2. **Go back to Supabase Dashboard** → Authentication → Providers → Google
3. **Verify** your Google Client ID and Client Secret are entered correctly
4. **Test** by clicking "Sign in with Google" on your app

## Common Mistakes to Avoid

❌ **Don't add** `http://localhost:5001/auth/callback` - This goes in JavaScript origins, not redirect URIs
❌ **Don't add** `https://your-vercel-app.vercel.app/auth/callback` - This goes in JavaScript origins, not redirect URIs  
❌ **Don't add** `https://www.example.com` or any placeholder URLs
✅ **Only add** the Supabase redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

## Understanding the Flow

1. **User clicks "Sign in with Google"** → Goes to Google OAuth
2. **Google redirects to Supabase** → `https://YOUR_PROJECT.supabase.co/auth/v1/callback` (this is what you put in Google Console)
3. **Supabase processes OAuth** → Creates session
4. **Supabase redirects to your app** → `http://localhost:5001/auth/callback` (handled by `redirectTo` in your code)
5. **Your app receives the session** → User is logged in

That's why you only need the Supabase URL in Google's redirect URIs!

## Quick Checklist

- [ ] Removed `https://www.example.com` from redirect URIs
- [ ] Replaced `https://xxx.supabase.co/auth/v1/callback` with your actual Supabase redirect URI
- [ ] Verified JavaScript origins include both localhost and production URL
- [ ] Saved changes in Google Console
- [ ] Verified Supabase has your Google Client ID and Secret
- [ ] Tested the login flow

## Still Having Issues?

If you get a "redirect_uri_mismatch" error:
1. Double-check the Supabase redirect URI matches EXACTLY (no trailing slashes)
2. Make sure you copied it from Supabase Dashboard → Authentication → Providers → Google
3. Wait a few minutes after saving - Google sometimes takes time to propagate changes
