# Setting Up Vercel Environment Variables

Your site deployed successfully! Now you need to set up the environment variables to enable the admin system.

## Step 1: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens/new
2. Token name: `Personal Website Admin`
3. Expiration: `No expiration` (or `1 year`)
4. Scopes: Check `repo` (Full control of private repositories)
5. Click `Generate token`
6. **COPY THE TOKEN IMMEDIATELY** - you won't see it again!

## Step 2: Add Environment Variables to Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Find your `personal-website` project
3. Click on it → Settings → Environment Variables
4. Add these variables:

### Required Variables:
- **Name**: `GITHUB_TOKEN`
  - **Value**: Your GitHub token from Step 1
  - **Environment**: Production, Preview, Development

- **Name**: `ADMIN_PASSWORD` 
  - **Value**: Your desired admin password (make it secure!)
  - **Environment**: Production, Preview, Development

## Step 3: Redeploy to Apply Variables

After adding the environment variables, trigger a new deployment:

```bash
npx vercel --prod
```

Or just push a commit to GitHub if you have auto-deployment set up.

## Step 4: Test Your Admin System

1. Visit your deployed site: https://personal-website-337jpnssq-colemans-projects-88dbb1b8.vercel.app
2. Click the "!" in "More to come!"
3. Login with your admin password
4. Try creating a test project or origami!

## Current Deployment

Your site is live at:
**https://personal-website-337jpnssq-colemans-projects-88dbb1b8.vercel.app**

Once you set up a custom domain (www.colemanlai.com), you can access it there instead.

## Troubleshooting

### If admin login doesn't work:
- Check that `ADMIN_PASSWORD` is set in Vercel
- Make sure you redeployed after adding the variables
- Clear browser cache

### If content creation fails:
- Verify `GITHUB_TOKEN` has `repo` scope
- Check it hasn't expired
- Look at Vercel function logs for errors

### Admin system features:
✅ Create projects and origami remotely  
✅ Upload images directly to GitHub  
✅ Edit content with markdown preview  
✅ Automatic deployment on changes  
✅ Version control for all edits  

Your remote admin system is ready to use once you add the environment variables!
