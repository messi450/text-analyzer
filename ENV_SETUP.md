# Environment Variables Setup Guide

## 🔐 Local Development (Your Machine)

### Step 1: Create `.env.local`
This file is already created for you and is **automatically ignored by Git**.

```bash
# File: .env.local
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

⚠️ **Important for Vite:**
- Use `VITE_` prefix (required for client-side access in Vite)
- No quotes around the value
- No spaces around the `=`

### Step 2: Add Your Real API Key
1. Get your OpenAI API key from: https://platform.openai.com/api-keys
2. Open `.env.local` in your editor
3. Replace `sk-your-actual-api-key-here` with your real key
4. Save the file

### Step 3: Restart Dev Server
Environment variables only load on startup:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 4: Test
The app should now work with your API key. Check the browser console for:
```
OpenAI Client Initialized: { hasKey: true, ... }
```

---

## 🚀 Production Deployment (Vercel)

`.env.local` does **NOT** get deployed. You must add environment variables in Vercel:

### Vercel Dashboard Setup:
1. Go to your project in Vercel Dashboard
2. Navigate to: **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `VITE_OPENAI_API_KEY`
   - **Value**: `sk-your-actual-api-key`
   - **Environment**: Select `Production`, `Preview`, and `Development`
4. Click **Save**
5. **Redeploy** your application

---

## 📁 File Structure

```
your-project/
├── .env.local          ← Your secret key (gitignored, local only)
├── .env.example        ← Template (safe to commit)
├── .gitignore          ← Already configured ✅
└── src/
    └── api/
        ├── base44Client.js
        └── openaiClient.js
```

---

## ✅ Security Checklist

- [x] `.env.local` is in `.gitignore`
- [x] `.env` is in `.gitignore`
- [x] API key uses `VITE_` prefix for Vite
- [x] `.env.example` exists as a template
- [ ] Add your real API key to `.env.local`
- [ ] Restart dev server after adding key
- [ ] Add environment variable in Vercel Dashboard

---

## 🔍 How to Verify

### Local:
```bash
# In browser console, you should see:
OpenAI Client Initialized: { hasKey: true, keyPrefix: 'sk-proj', ... }
```

### Production:
After deploying to Vercel, check the deployment logs for any environment variable errors.

---

## ⚠️ Common Issues

### Issue: "API key is not configured"
**Solution**: Make sure you:
1. Added the key to `.env.local` (not `.env`)
2. Used `VITE_OPENAI_API_KEY` (with `VITE_` prefix)
3. Restarted the dev server

### Issue: Key shows as `undefined` in console
**Solution**: 
- Vite requires the `VITE_` prefix for client-side variables
- Restart the dev server (environment variables load only on startup)

### Issue: Works locally but not on Vercel
**Solution**: 
- Add the environment variable in Vercel Dashboard
- Make sure to redeploy after adding the variable

---

## 🎯 Quick Reference

| Environment | File/Location | Variable Name |
|-------------|---------------|---------------|
| Local Dev | `.env.local` | `VITE_OPENAI_API_KEY` |
| Vercel Production | Vercel Dashboard | `VITE_OPENAI_API_KEY` |
| Template | `.env.example` | `VITE_OPENAI_API_KEY` |

---

## 📝 Notes

- **Vite vs Next.js**: This project uses Vite, which requires the `VITE_` prefix for environment variables exposed to the client
- **Never commit**: `.env`, `.env.local`, or any file with real API keys
- **Always commit**: `.env.example` as a template for other developers
