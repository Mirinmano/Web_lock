# Environment Setup Guide

## Quick Start

1. **Copy the example file:**
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Get your Aiven credentials:**
   - Go to [Aiven Console](https://console.aiven.io)
   - Create or select a PostgreSQL service
   - Go to the service overview
   - Click "Connection information"
   - Copy the connection details

3. **Fill in `.env` file:**
   
   **Option 1: Use DATABASE_URL (recommended)**
   ```env
   DATABASE_URL=postgresql://avnadmin:your-password@your-host.a.aivencloud.com:12345/defaultdb?sslmode=require
   ```
   
   **Option 2: Use individual parameters**
   ```env
   AIVEN_HOST=your-actual-host.a.aivencloud.com
   AIVEN_PORT=your-actual-port
   AIVEN_DATABASE=defaultdb
   AIVEN_USER=avnadmin
   AIVEN_PASSWORD=your-actual-password
   ```
   
   **Note:** If you provide `DATABASE_URL`, the individual parameters will be ignored.

4. **Generate a secure JWT secret:**
   ```bash
   # On Linux/Mac:
   openssl rand -base64 32
   
   # Or use any random string generator
   ```

5. **Update CORS origins:**
   - For development: `http://localhost:3000,chrome-extension://*`
   - For production: Add your actual extension ID and domain

## Example .env File

```env
# Aiven PostgreSQL Connection (using DATABASE_URL)
DATABASE_URL=postgresql://avnadmin:AVNSuperSecretPassword123@my-project-12345.a.aivencloud.com:12345/defaultdb?sslmode=require

# Or using individual parameters:
# AIVEN_HOST=my-project-12345.a.aivencloud.com
# AIVEN_PORT=12345
# AIVEN_DATABASE=defaultdb
# AIVEN_USER=avnadmin
# AIVEN_PASSWORD=AVNSuperSecretPassword123
# AIVEN_SSL_MODE=require

# Server Configuration
PORT=3000
JWT_SECRET=my-super-secret-jwt-key-abc123xyz789
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=http://localhost:3000,chrome-extension://abcdefghijklmnopqrstuvwxyz123456,https://api.myapp.com
```

## Security Notes

- ⚠️ **Never commit `.env` to git** (it's in `.gitignore`)
- 🔒 Use strong, unique passwords
- 🔑 Generate a secure JWT_SECRET (at least 32 characters)
- 🌐 Restrict CORS origins in production
- 🔐 Use different credentials for development and production

## Testing Connection

After setting up `.env`, test the connection:

```bash
cd server
npm run migrate
```

If successful, you'll see:
```
✅ Connected to Aiven PostgreSQL database
✅ Users table created
✅ Locked sites table created
✅ Indexes created
🎉 Migration completed successfully!
```

