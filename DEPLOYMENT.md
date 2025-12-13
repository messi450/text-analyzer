# Textalyzer Deployment Guide

## Quick Deployment to Vercel

### Prerequisites
- GitHub account (create at github.com)
- Vercel account (create at vercel.com)
- Domain name (buy from Namecheap, GoDaddy, or similar)

### Step 1: Push to GitHub

```bash
# Navigate to project directory
cd d:\Projects\textalyzer

# Add all files
git add .

# Commit
git commit -m "Initial commit: Textalyzer app ready for production"

# Create new repository on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/textalyzer.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to **vercel.com**
2. Click **"New Project"**
3. Select your GitHub repository
4. Vercel will auto-detect:
   - Framework: Vite ✓
   - Build Command: `npm run build` ✓
   - Output: `dist` ✓
5. Click **Deploy** and wait 2-5 minutes
6. You get a free `.vercel.app` URL immediately ✓

### Step 3: Connect Custom Domain

#### Option A: Buy Domain First (Recommended)

1. Buy domain at:
   - **Namecheap** (cheapest, great support)
   - **Porkbun** (user-friendly)
   - **GoDaddy** (most popular)

**Recommended domains:**
- `textanalyze.app`
- `textanalyzer.app`
- `textanalyze.io`
- `writeanalyzer.app`

#### Option B: Connect Domain to Vercel

**At Vercel Dashboard:**
1. Project → **Settings** → **Domains**
2. Enter your domain: `textanalyze.app`
3. Choose connection method:
   - **Vercel Nameservers** (easiest - Vercel manages DNS)
   - **CNAME** (if you want to keep current registrar)

**If using Vercel Nameservers:**
1. Copy the 4 nameservers Vercel provides
2. Go to domain registrar
3. Replace nameservers with Vercel's
4. Wait 24-48 hours for DNS propagation

**If using CNAME:**
1. Go to domain registrar DNS settings
2. Add CNAME record:
   - Name: `www`
   - Value: `cname.vercel.sh`
3. Also add:
   - Name: `@` (root)
   - Value: `textanalyze.app`

### Step 4: SSL/HTTPS

✅ **Automatic!** Vercel provisions Let's Encrypt SSL certificates automatically.

Your site will be live at `https://textanalyze.app` within minutes.

---

## Environment Variables (if needed)

Create `.env.local` in project root:

```env
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_BASE44_APP_ID=692ee5cf01eb8c5c45d1e044
```

Then redeploy on Vercel.

---

## Troubleshooting

**Build fails?**
- Check `npm run build` locally first
- Verify all dependencies are listed in `package.json`

**Domain not connecting?**
- Wait 24-48 hours for DNS propagation
- Clear browser cache (Ctrl+Shift+Del)
- Check Vercel dashboard for domain verification status

**Site shows 404?**
- Vercel rewrites are configured in `vercel.json`
- Clear cache and hard refresh (Ctrl+F5)

---

## Cost Breakdown

- **Vercel hosting**: FREE (Hobby plan, unlimited bandwidth)
- **Domain**: $8-15/year
- **Total first year**: ~$10-15
- **After first year**: ~$10-15/year

---

## Performance Optimizations Already Included

✅ Code splitting (Vite automatic)
✅ Tree-shaking (unused code removed)
✅ Minification & compression
✅ Asset caching headers (1 year)
✅ Security headers (X-Frame-Options, CSP, etc.)
✅ Gzip compression
✅ Image optimization ready

Current bundle size: ~460KB gzipped (very good for a React app)

---

## Next Steps After Deployment

1. **SEO**: Update meta tags in `src/main.jsx` and `dist/index.html`
2. **Analytics**: Add Google Analytics ID to `.env`
3. **Monitoring**: Set up Vercel Analytics
4. **Backups**: Git backup is your source control

---

## Support

- Vercel docs: https://vercel.com/docs
- React docs: https://react.dev
- Questions? Check Vercel dashboard for logs

Good luck launching! 🚀
