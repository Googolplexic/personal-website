# 🚀 GitHub Actions Deployment Setup

Your website's automatic deployment is failing because GitHub Actions needs Vercel credentials. Here's how to fix it:

## ❌ Current Issue
```
Error: No existing credentials found. Please run `vercel login` or pass "--token"
```

The GitHub Actions workflows need these secrets to deploy your site automatically when you push to GitHub.

## ✅ Solution: Add GitHub Secrets

### Step 1: Get Your Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name: `GitHub Actions Deployment`
4. Expiration: No expiration (or 1 year)
5. Scope: Full Account
6. Click **"Create"**
7. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

### Step 2: Add Secrets to GitHub

1. Go to your repository: https://github.com/Googolplexic/personal-website
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add these **3 secrets**:

#### Required Secrets:

**Secret 1:**
- **Name**: `VERCEL_TOKEN`
- **Value**: Your token from Step 1

**Secret 2:**
- **Name**: `VERCEL_ORG_ID` 
- **Value**: `team_ecqzaH9tVkZsueAjOiRQ7aLM`

**Secret 3:**
- **Name**: `VERCEL_PROJECT_ID`
- **Value**: `prj_93aMaS3vZUefTshU1sbCcuEyoV6N`

### Step 3: Test the Deployment

After adding the secrets, make any small change and push to GitHub:

```bash
git add .
git commit -m "Test automatic deployment"
git push
```

The GitHub Actions workflow will automatically run and deploy your site!

## 🔧 What I Fixed

1. **Disabled conflicting workflows**: You had 3 different deployment workflows running simultaneously
2. **Simplified deployment**: Now using one clean GitHub Actions workflow 
3. **Removed API references**: The workflow was trying to deploy a separate API project that doesn't exist

## 📋 Current Setup

- **Active Workflow**: `.github/workflows/deploy-simple.yml`
- **Disabled Workflows**: `deploy.yml` and `deploy-api.yml` (set to manual trigger only)
- **Deploy Target**: Your existing Vercel project
- **Domain**: Will deploy to your existing custom domain once configured

## 🚨 Important Notes

- **Add ALL 3 secrets** or deployment will fail
- **Use exact names** for the secrets (case-sensitive)
- **Copy values exactly** (no extra spaces)
- The deployment will trigger automatically on every push to `main` branch

## ✅ Success Indicators

Once working, you'll see:
- ✅ Green checkmark on your GitHub commits
- 🚀 Automatic deployments to https://www.colemanlai.com
- 📧 Email notifications from Vercel when deployments complete

## 🆘 Troubleshooting

### If deployment still fails:
1. **Check secret names**: Must be exactly `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
2. **Verify token**: Make sure it hasn't expired and has full account access
3. **Check workflow logs**: Go to Actions tab in GitHub to see detailed error messages

### If you need help:
- Check the GitHub Actions logs in your repository
- Make sure you have the correct permissions on both GitHub and Vercel
- Verify your Vercel project is connected to the correct GitHub repository

---

**Next Step**: Add those 3 GitHub secrets and push a commit to test! 🎉
