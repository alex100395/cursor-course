# Test Before Deploying - Step by Step

## ⚠️ CRITICAL: Test Production Build Locally First

Before deploying to production, test the production build locally to catch issues:

```bash
# 1. Build the production version
npm run build

# 2. Start the production server
npm run start

# 3. Open http://localhost:5001
# 4. Test the full login flow
```

**If it works locally but not in production, the issue is:**
- Environment variables not set in Vercel
- Supabase redirect URLs not configured
- CORS/cookie issues

## What to Check After Login

### 1. Browser Console (F12)
Look for these logs in order:

```
✅ Session set successfully: [your-email]
✅ User profile created/updated
⏳ Waiting for session to persist...
✅ Session verified before redirect
🔄 Redirecting to home page...
```

Then on the home page:
```
✅ Session check: Found user: [your-email]
```

### 2. If You See Errors

**"❌ Session check: No session found"**
- Check LocalStorage (Application tab → Local Storage)
- Look for keys starting with `sb-` or `supabase`
- If keys exist but session not found → Session might be expired/invalid

**"❌ Error getting session: [error]"**
- Check the error message
- Common: Network error, CORS, or Supabase URL wrong

**"⚠️ Session not found after setting"**
- Session not being saved to localStorage
- Check browser console for localStorage errors
- Try different browser or incognito mode

### 3. Manual Verification

After logging in, open browser console and run:

```javascript
// Check session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Check localStorage
console.log('LocalStorage keys:', Object.keys(localStorage).filter(k => 
  k.includes('supabase') || k.includes('sb-')
));
```

### 4. Network Tab Check

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. After login, check:
   - `/api/users/upsert` → Should be 200 OK
   - `/api/validate-key` → Should include `Authorization: Bearer ...` header

## If It Still Doesn't Work

1. **Check Supabase Dashboard:**
   - Authentication → Users → See if your user exists
   - Authentication → URL Configuration → Verify redirect URLs

2. **Check Vercel Environment Variables:**
   - Settings → Environment Variables
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

3. **Check Browser:**
   - Try incognito/private window
   - Clear cookies and localStorage
   - Try different browser

4. **Check Network:**
   - Are you behind a corporate firewall?
   - Try different network (mobile hotspot)

## Expected Behavior

✅ **Working correctly:**
- After login → Redirects to home
- Home page shows your name/avatar
- Logout button visible
- API keys section visible (if you have keys)

❌ **Not working:**
- After login → Redirects but shows "Sign in" button
- No name/avatar shown
- API keys not visible
- Console shows "No session"
