# Deployment Configuration

This document explains how to set up automatic deployment to Vercel for your personal website.

## Frontend Deployment (www.colemanlai.com)

The frontend is automatically deployed to Vercel when you push to the main branch.

### Required GitHub Secrets

Add these secrets to your GitHub repository settings:

1. `VERCEL_TOKEN` - Your Vercel authentication token
2. `VERCEL_ORG_ID` - Your Vercel organization ID
3. `VERCEL_PROJECT_ID` - Your frontend project ID in Vercel

### Vercel Project Setup

1. Connect your GitHub repository to Vercel
2. Set the project name to match your domain: `www.colemanlai.com`
3. Configure environment variables in Vercel dashboard:
   - `VITE_API_URL` = `https://api.colemanlai.com/api`

## API Server Deployment (api.colemanlai.com)

The API server can be deployed as a separate Vercel project.

### Required GitHub Secrets (Additional)

Add this additional secret:

1. `VERCEL_API_PROJECT_ID` - Your API project ID in Vercel

### Vercel API Project Setup

1. Create a new Vercel project for the server
2. Set the project name to: `api.colemanlai.com`
3. Set the root directory to: `server`
4. Configure environment variables in Vercel dashboard:
   - `ADMIN_PASSWORD` = Your secure admin password
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://www.colemanlai.com`

## Manual Deployment

You can also deploy manually using the Vercel CLI:

### Frontend
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
vercel --prod

# Or use npm script
npm run deploy
```

### API Server
```bash
# Deploy API server
cd server
vercel --prod
```

## Domain Configuration

Make sure your domains point to Vercel:

1. `www.colemanlai.com` → Frontend Vercel project
2. `api.colemanlai.com` → API Vercel project
3. `colemanlai.com` → Redirects to `www.colemanlai.com`

## Environment Switching

Use the provided scripts to switch between environments:

```bash
# Windows
setup-env.bat production

# Unix/Linux
./setup-env.sh production
```

## Security Notes

- The admin password is stored as a Vercel environment variable
- CORS is configured to only allow requests from your domain
- Security headers are added via vercel.json

## Monitoring

- Vercel provides automatic monitoring and analytics
- Check the Vercel dashboard for deployment status
- View logs in the Vercel dashboard for debugging
