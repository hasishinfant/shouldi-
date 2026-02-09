# Deployment Instructions

## Deploy to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `shouldi-comic-decision-assistant`
3. Don't initialize with README (we already have one)

### Step 2: Add Remote and Push

```bash
git remote add origin https://github.com/YOUR_USERNAME/shouldi-comic-decision-assistant.git
git branch -M main
git push -u origin main
```

### Step 3: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**

### Step 4: Add API Key Secret

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `VITE_GROQ_API_KEY`
4. Value: Your Groq API key (from your .env.local file)
5. Click **Add secret**

### Step 5: Deploy

The GitHub Action will automatically deploy when you push to main.

Your site will be live at:
```
https://YOUR_USERNAME.github.io/shouldi-comic-decision-assistant/
```

## Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
npm run deploy
```

This will build and deploy to the `gh-pages` branch.

## Important Notes

⚠️ **Security**: The API key is exposed in the client-side code. For production:
- Consider using a backend proxy
- Implement rate limiting
- Use environment-specific keys
- Monitor API usage

## Troubleshooting

If the site doesn't load:
1. Check GitHub Actions tab for build errors
2. Verify the API key secret is set correctly
3. Ensure GitHub Pages is enabled in repository settings
4. Wait a few minutes for DNS propagation
