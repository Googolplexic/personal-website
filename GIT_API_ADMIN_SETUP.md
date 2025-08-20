# Git API Admin System Setup

## Overview

Your admin system now works with GitHub API to edit content directly in your repository, automatically triggering deployments. This means you can edit your website from anywhere without running a local server!

## Required Setup

### 1. GitHub Personal Access Token

You need a GitHub token with repository access:

1. Go to https://github.com/settings/tokens/new
2. Name: "Personal Website Admin"
3. Expiration: No expiration (or 1 year)
4. Scopes: Select `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### 2. Environment Variables in Vercel

Add these environment variables in your Vercel dashboard:

1. **GITHUB_TOKEN** = `your_github_token_here`
2. **ADMIN_PASSWORD** = `your_secure_password_here`

### 3. Deploy the New System

```bash
# Install new dependencies
npm install

# Build and deploy
npm run build
npx vercel --prod
```

## How It Works

### Remote Admin Access
- Visit https://www.colemanlai.com and click the "!" in "More to come!"
- Login with your admin password
- Create/edit projects and origami directly from your live website
- Changes are committed to GitHub and trigger automatic deployments

### Local Development (Optional)
```bash
# To use local server for development
echo "VITE_USE_LOCAL_SERVER=true" > .env.local
npm run dev

# Start local admin server (in separate terminal)
cd server && npm start
```

### Git-Based Workflow
- All changes are committed to your repository
- Automatic deployment triggers when files change
- Full version control history
- No need for separate server hosting

## API Endpoints

The new serverless functions provide:

- `/api/auth` - Authentication
- `/api/create-content` - Create projects/origami
- `/api/upload-image` - Upload images
- `/api/content-list` - List existing content

## Benefits

✅ **Remote Access** - Edit from anywhere with internet  
✅ **No Server Costs** - Runs on Vercel serverless functions  
✅ **Version Control** - All changes tracked in Git  
✅ **Auto Deployment** - Changes deploy automatically  
✅ **Same Interface** - Keep the admin UI you're used to  
✅ **Secure** - GitHub token authentication

## Troubleshooting

### If admin login fails:
1. Check ADMIN_PASSWORD is set in Vercel environment variables
2. Clear browser cache and try again

### If content creation fails:
1. Verify GITHUB_TOKEN has repo permissions
2. Check Vercel function logs for errors
3. Ensure token hasn't expired

### If images don't upload:
1. Check image size (Vercel has 4.5MB limit for requests)
2. Verify GitHub token permissions
3. Check browser network tab for errors

## Migration from Local Server

Your existing local admin server still works for development. To switch:

- **Use serverless functions**: Set `VITE_USE_LOCAL_SERVER=false`
- **Use local server**: Set `VITE_USE_LOCAL_SERVER=true` and start server
