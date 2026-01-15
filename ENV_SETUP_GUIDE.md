# Environment Variables Setup Guide

## Required Environment Variables

Your `.env.local` file should contain the following variables:

### 1. Supabase Configuration (✅ You already have these)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xalevmbgzsoclkxosaup.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Get Service Role Key from Supabase Dashboard:**
1. Go to your Supabase project dashboard
2. Navigate to: **Settings** → **API**
3. Under "Project API keys", find the **`service_role`** key (NOT the `anon` key)
4. Copy the service role key (this bypasses RLS for server-side operations)
5. ⚠️ **IMPORTANT**: Never expose this key to the client-side! It should only be used in server-side code.

### 2. Google OAuth Credentials

**Get from Google Cloud Console:**
1. Go to https://console.cloud.google.com/
2. Navigate to: **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Copy:
   - **Client ID**: `993360061052-k476ijsj132c8rtgcco6lcplnqr2tqdc.apps.googleusercontent.com` (you have this)
   - **Client Secret**: (click "Reset secret" if you need to see it again)

```env
GOOGLE_CLIENT_ID=993360061052-k476ijsj132c8rtgcco6lcplnqr2tqdc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

**Important:** These also need to be added in **Supabase Dashboard** → **Authentication** → **Providers** → **Google**

### 3. OpenAI API Key (for GitHub Summarizer)

**Get from OpenAI:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (you'll only see it once!)

```env
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
```

## How to Update Your .env.local

1. Open `my-app/.env.local` in your editor
2. Replace the placeholder values:
   - `YOUR_GOOGLE_CLIENT_SECRET_HERE` → Your actual Google Client Secret
   - `YOUR_OPENAI_API_KEY_HERE` → Your actual OpenAI API Key
3. Save the file
4. **Restart your dev server** (`yarn dev`) for changes to take effect

## Important Notes

### Supabase vs NextAuth
- **This project uses Supabase Auth** (not NextAuth.js)
- Google OAuth credentials are configured in **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
- The env variables are optional but can be useful if you need to reference them in code

### Security
- ✅ Never commit `.env.local` to git (it's already in `.gitignore`)
- ✅ Never share your API keys or secrets
- ✅ Use different keys for development and production

## Quick Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - ✅ You have this
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - ✅ You have this
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - ⚠️ **Required** - Get from Supabase Dashboard → Settings → API
- [ ] `GOOGLE_CLIENT_ID` - ✅ You have this
- [ ] `GOOGLE_CLIENT_SECRET` - ⚠️ Need to add from Google Console
- [ ] `OPENAI_API_KEY` - ⚠️ Need to add from OpenAI Platform
- [ ] Google credentials added to Supabase Dashboard - ⚠️ Need to do this

## Testing

After setting up:
1. Restart your dev server: `yarn dev`
2. Test Google login: Click "Sign in with Google"
3. Test GitHub summarizer: Use an API key and test the endpoint
