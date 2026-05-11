# HopePMS Deployment Guide

## Deploy to Vercel
1. vercel.com → sign in with GitHub → Add New Project → import hopepms
2. Add Environment Variables:
   - VITE_SUPABASE_URL = your Supabase URL
   - VITE_SUPABASE_ANON_KEY = your anon key
3. Click Deploy → copy production URL (e.g. https://hopepms.vercel.app)

## Configure Supabase for Production
1. Supabase → Authentication → URL Configuration
2. Site URL: https://hopepms.vercel.app
3. Redirect URLs: https://hopepms.vercel.app/auth/callback
4. Save

## Configure Google OAuth for Production
1. Google Cloud Console → Credentials → edit your OAuth client
2. Add Authorized redirect URI: https://[supabase-project-id].supabase.co/auth/v1/callback
3. Save