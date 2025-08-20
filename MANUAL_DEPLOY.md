# Manual Deployment Guide

## Quick Deployment Steps

### 1. Login to Vercel
```bash
npx vercel login
```

### 2. Deploy Frontend
```bash
# Build the frontend first
npm run build

# Deploy to Vercel
npx vercel --prod
```

### 3. Deploy API Server
```bash
cd server
npx vercel --prod
```

## Setting up GitHub Actions

### Required Secrets in GitHub Repository Settings

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

1. **VERCEL_TOKEN**
   - Go to https://vercel.com/account/tokens
   - Create a new token
   - Copy and paste as secret value

2. **VERCEL_ORG_ID**
   - Run `npx vercel` in your project
   - Look for the org ID in the output or check `.vercel/project.json`

3. **VERCEL_PROJECT_ID**
   - Same as above, get the project ID for frontend

4. **VERCEL_API_PROJECT_ID**
   - Deploy your server manually first with `cd server && npx vercel`
   - Get the project ID for the API server

## Troubleshooting

### If deployment fails:
1. Make sure you're logged in: `npx vercel login`
2. Update Vercel CLI: `npm install -g vercel@latest`
3. Clear cache: `npm cache clean --force`
4. Try manual deployment first before setting up GitHub Actions

### If GitHub Actions fails:
1. Check that all secrets are properly set
2. Make sure your repository is public or you have the right permissions
3. Check the Actions tab for detailed error logs
