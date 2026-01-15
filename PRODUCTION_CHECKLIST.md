# Production vs Localhost - Configuration Checklist

Since localhost works but production doesn't, the issue is **configuration**, not code.

## ✅ Step 1: Verify Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these are set for **Production**:
   - `NEXT_PUBLIC_SUPABASE_URL` - Should be your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Should be your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Should be your service role key (if used)

**Common mistake:** Variables set for "Development" but not "Production"

## ✅ Step 2: Verify Supabase Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Check **Redirect URLs** - Must include:
   - `http://localhost:5001/auth/callback` (for localhost)
   - `https://your-production-domain.vercel.app/auth/callback` (for production)

**Common mistake:** Only localhost URL is configured

## ✅ Step 3: Verify Supabase Site URL

In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL** should be: `https://your-production-domain.vercel.app`

**Common mistake:** Site URL is still set to `http://localhost:5001`

## ✅ Step 4: Check Browser Console in Production

After logging in on production, open browser console (F12) and check:

1. **Look for errors:**
   - CORS errors
   - Network errors
   - "Supabase environment variables are missing"

2. **Check the auth callback:**
   - After clicking "Sign in with Google", you should be redirected to `/auth/callback`
   - Check if there are any errors on that page

3. **Check localStorage:**
   - Application tab → Local Storage → Your domain
   - Look for keys starting with `sb-` or `supabase`
   - If no keys exist after login, session isn't being saved

## ✅ Step 5: Test the Debug Page

Visit: `https://your-production-domain.vercel.app/debug-auth`

This will show:
- Current session state
- LocalStorage keys
- Any errors

## ✅ Step 6: Common Production Issues

### Issue: "Supabase environment variables are missing"
**Fix:** Set environment variables in Vercel for Production environment

### Issue: Redirects to localhost after Google login
**Fix:** Update Supabase Redirect URLs to include production domain

### Issue: Session not persisting
**Possible causes:**
- Cookies blocked (check browser settings)
- SameSite cookie issues (HTTPS vs HTTP)
- localStorage blocked by browser extensions

### Issue: CORS errors
**Fix:** Check Supabase CORS settings in dashboard

## ✅ Step 7: Quick Test

1. **Clear browser cache and cookies** for your production domain
2. **Open in incognito/private window**
3. **Try logging in again**
4. **Check console for errors**

## 🔍 Most Likely Issues (in order):

1. **Environment variables not set in Vercel Production** ← Most common
2. **Supabase Redirect URLs missing production domain**
3. **Supabase Site URL still set to localhost**
4. **Browser blocking cookies/localStorage**

## 📋 What to Share if Still Not Working:

1. Screenshot of Vercel Environment Variables (Production)
2. Screenshot of Supabase URL Configuration
3. Browser console errors (F12 → Console)
4. What you see on `/debug-auth` page
5. Network tab → Check `/auth/callback` request
