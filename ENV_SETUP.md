# 🚀 Environment Setup

This project requires environment files to be created from templates before running.

## Quick Setup

### Option 1: Use Setup Scripts (Recommended)

```bash
# Windows
setup-env.bat development

# Unix/Linux/Mac
./setup-env.sh development
```

### Option 2: Manual Setup

1. **Frontend Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

2. **Server Environment**:
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your settings
   ```

## Environment Options

- **development** - Local development (localhost)
- **production** - Production deployment (colemanlai.com)
- **local** - Local network access

## Important Notes

⚠️ **Never commit .env files to git!** They contain sensitive information.

✅ **Always use .env.example as templates** for creating your local .env files.

## Default Configuration

The example files are configured for local development. For production deployment, make sure to:

1. Change the admin password in `server/.env`
2. Update API URLs to point to your deployed server
3. Set appropriate CORS origins

## Need Help?

Check `DEPLOYMENT.md` for detailed deployment instructions.
