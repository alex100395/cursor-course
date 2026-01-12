# Google SSO Setup Guide

This guide will walk you through setting up Google Single Sign-On (SSO) for your application using Supabase Auth.

## Step-by-Step Configuration

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project (or select existing)**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter project name (e.g., "My App SSO")
   - Click "Create"

3. **Enable Google+ API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click on it and click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - User Type: External (or Internal if using Google Workspace)
     - App name: Your app name
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue"
     - Scopes: Click "Save and Continue" (default scopes are fine)
     - Test users: Add your email, then "Save and Continue"
   - Back to creating OAuth client:
     - Application type: **Web application**
     - Name: "My App Web Client"
     - **Authorized JavaScript origins:**
       - `http://localhost:5001` (for development)
       - `https://yourdomain.com` (for production)
     - **Authorized redirect URIs:**
       - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
       - You'll get this from Supabase in the next step
   - Click "Create"
   - **IMPORTANT**: Copy the **Client ID** and **Client Secret** - you'll need these!

### Step 2: Configure Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in and select your project

2. **Navigate to Authentication Settings**
   - In the left sidebar, click "Authentication"
   - Click "Providers" in the submenu

3. **Enable Google Provider**
   - Find "Google" in the list of providers
   - Toggle it to "Enabled"
   - Enter your Google OAuth credentials:
     - **Client ID (for OAuth)**: Paste your Google Client ID
     - **Client Secret (for OAuth)**: Paste your Google Client Secret
   - Click "Save"

4. **Get Your Redirect URI**
   - In the Google provider settings, you'll see a redirect URI
   - It looks like: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Copy this exact URL

5. **Update Google OAuth Settings**
   - Go back to Google Cloud Console > Credentials
   - Edit your OAuth 2.0 Client ID
   - Add the Supabase redirect URI to "Authorized redirect URIs":
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Click "Save"

### Step 3: Configure Environment Variables

1. **Create/Update `.env.local` file** in your project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

2. **Get Supabase Credentials:**
   - Go to Supabase Dashboard > Settings > API
   - Copy:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 4: Test the Integration

1. **Start your development server:**
   ```bash
   yarn dev
   ```

2. **Visit your app:**
   - Go to `http://localhost:5001`
   - Click "Sign in with Google" button
   - You should be redirected to Google's login page
   - After signing in, you'll be redirected back to your app

3. **Verify Authentication:**
   - Check that your user info appears in the header
   - Check Supabase Dashboard > Authentication > Users to see your user

## Troubleshooting

### Issue: "redirect_uri_mismatch" error
**Solution:** 
- Make sure the redirect URI in Google Console exactly matches:
  - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- Check for trailing slashes or typos

### Issue: "Access blocked: This app's request is invalid"
**Solution:**
- Make sure you've added your email as a test user in Google OAuth consent screen
- If in production, you need to publish your OAuth app

### Issue: "Invalid client" error
**Solution:**
- Verify your Client ID and Client Secret in Supabase match Google Console
- Make sure you copied the correct credentials (not the service account key)

### Issue: User not appearing after login
**Solution:**
- Check Supabase Dashboard > Authentication > Users
- Verify your Supabase environment variables are correct
- Check browser console for errors

## Production Deployment

When deploying to production:

1. **Update Google OAuth Settings:**
   - Add your production domain to "Authorized JavaScript origins"
   - Add your production domain redirect URI

2. **Update Environment Variables:**
   - Set production environment variables in your hosting platform
   - Never commit `.env.local` to version control

3. **Update Supabase Settings:**
   - Go to Authentication > URL Configuration
   - Add your production site URL to "Site URL"
   - Add redirect URLs if needed

## Security Best Practices

1. ✅ Never commit `.env.local` to git
2. ✅ Use different OAuth credentials for development and production
3. ✅ Regularly rotate your OAuth client secrets
4. ✅ Monitor authentication logs in Supabase Dashboard
5. ✅ Use Row Level Security (RLS) policies in Supabase for data protection

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signinwithoauth)
