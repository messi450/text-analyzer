# Textalyzer 📝✨

A powerful, AI-powered text analyzer for readability, sentiment, grammar, and writing style improvements. Built with React, Vite, and Tailwind CSS.

![Textalyzer](https://img.shields.io/badge/version-1.0.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- **📊 Text Statistics**: Words, characters, sentences, paragraphs, unique words, reading time
- **📖 Readability Analysis**: Flesch Reading Ease, Grade Level, Audience Level
- **💭 Sentiment Analysis**: Positive/Negative/Neutral detection with word-level analysis
- **🔍 Writing Suggestions**: Grammar, style, clarity, and tone improvements
- **⚡ One-Click Fixes**: Apply suggestions instantly with a single click
- **🎯 Fix All**: Apply all fixes at once efficiently
- **📈 Overall Score**: 0-100 score based on readability, structure, vocabulary, and clarity
- **📄 PDF Export**: Beautiful reports with highlighted issues
- **🔐 Local Authentication**: Secure login with localStorage (no external server needed)
- **🌐 100% Offline**: Works completely without internet after first load

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/textalyzer.git
cd textalyzer

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## 🌐 Deployment

### Option 1: Vercel (Recommended - Easiest)

1. **Create a Vercel account** at [vercel.com](https://vercel.com)

2. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
4. **For production**:
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Create a Netlify account** at [netlify.com](https://netlify.com)

2. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

3. **Build and Deploy**:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Option 3: Firebase Hosting

1. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com)

2. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

3. **Initialize Firebase** (select Hosting):
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Use `dist` as the public directory
   - Configure as single-page app: Yes
   - Don't overwrite index.html

4. **Build and Deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

### Option 4: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install -D gh-pages
   ```

2. **Add to package.json scripts**:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

3. **Update vite.config.js** (add base path):
   ```js
   base: '/textalyzer/',
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

### Option 5: Any Static Host (Manual)

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the contents of the `dist` folder to your hosting provider

3. Configure URL rewriting for SPA (redirect all routes to index.html)

## 🛠️ Configuration

### Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
VITE_APP_NAME=Textalyzer
VITE_APP_URL=https://your-domain.com
```

## 📱 Progressive Web App

The app is PWA-ready! Users can:
- Install it on their device
- Use it offline
- Get app-like experience

## 🔐 Authentication

The app uses a **local authentication system** stored in localStorage:
- No external server required
- Data stays on user's device
- Passwords are hashed with SHA-256
- Sessions expire after 7 days

For production with multiple users, consider:
- Firebase Authentication
- Auth0
- Supabase Auth

## 🎨 Customization

### Colors & Theme

Edit `src/index.css` to customize the color scheme. The app uses CSS variables for easy theming.

### Logo

Replace `public/favicon.svg` and update `public/manifest.json` with your logo.

## 📊 Scoring Algorithm

The overall score (0-100) is calculated based on:

| Category | Points | Criteria |
|----------|--------|----------|
| Readability | 25 | Flesch Reading Ease score |
| Sentence Structure | 20 | Average sentence length |
| Vocabulary Richness | 20 | Type-Token Ratio |
| Clarity & Style | 20 | Number of issues found |
| Content Depth | 15 | Text length and structure |
| Bonus | +5 | Balanced tone, varied vocabulary |

## 📁 Project Structure

```
textalyzer/
├── public/           # Static assets
├── src/
│   ├── components/   # React components
│   │   ├── ui/       # shadcn/ui components
│   │   └── text-analyzer/  # App-specific components
│   ├── lib/          # Utilities and auth
│   ├── pages/        # Page components
│   ├── api/          # API clients (optional)
│   ├── App.jsx       # Root component
│   ├── main.jsx      # Entry point
│   └── index.css     # Global styles
├── index.html        # HTML template
├── vite.config.js    # Vite configuration
├── tailwind.config.js # Tailwind configuration
├── firebase.json     # Firebase hosting config
├── vercel.json       # Vercel config
├── netlify.toml      # Netlify config
└── package.json      # Dependencies
```

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

### Port Already in Use

The dev server automatically finds an available port. Check the terminal output for the actual URL.

### PWA Not Installing

- Ensure you're using HTTPS in production
- Check that manifest.json is valid
- Clear browser cache

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📬 Support

If you have any questions or issues, please open an issue on GitHub.

---

Made with ❤️ by Textalyzer Team
