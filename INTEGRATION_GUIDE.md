# Aiven Database Integration Guide

This guide explains how to integrate the Aiven PostgreSQL database with the Website Locker extension.

## Architecture

The extension now uses a backend API server that connects to Aiven PostgreSQL instead of Chrome's local storage. This provides:
- Centralized data storage
- Multi-device synchronization
- Better security with encrypted connections
- Scalability

## Setup Instructions

### 1. Create Aiven PostgreSQL Database

1. Sign up/login at [Aiven.io](https://aiven.io)
2. Create a new PostgreSQL service
3. Note your connection details:
   - Host
   - Port
   - Database name
   - Username
   - Password

### 2. Setup Backend Server

```bash
cd server
npm install
```

### 3. Configure Environment

Create `server/.env` file:
```env
AIVEN_HOST=your-project.a.aivencloud.com
AIVEN_PORT=12345
AIVEN_DATABASE=defaultdb
AIVEN_USER=avnadmin
AIVEN_PASSWORD=your-password
AIVEN_SSL_MODE=require

PORT=3000
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000,chrome-extension://*
```

### 4. Run Database Migrations

```bash
cd server
npm run migrate
```

This creates the necessary tables:
- `users` - User accounts
- `locked_sites` - Locked websites per user

### 5. Start the API Server

```bash
npm start
```

The server will run on `http://localhost:3000` (or your configured PORT).

### 6. Update Extension Configuration

In `api.js`, update the API_BASE_URL:
```javascript
const API_BASE_URL = 'https://your-api-domain.com/api';
```

Or set it via environment variable when building.

## Migration from Chrome Storage

The extension can work in two modes:

1. **API Mode** (default with Aiven) - Uses backend API
2. **Local Mode** - Falls back to chrome.storage if API is unavailable

To switch between modes, update the code to check API availability first.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user  
- `POST /api/auth/verify-pin` - Verify unlock PIN

### Sites
- `POST /api/sites/list` - Get all locked sites
- `POST /api/sites/state` - Get site lock state
- `POST /api/sites/add` - Add locked site
- `POST /api/sites/update-state` - Update site state
- `POST /api/sites/remove` - Remove locked site

## Security Notes

- Passwords are hashed using bcrypt
- PINs are stored in plain text (for quick verification)
- All connections use SSL/TLS
- CORS is configured for extension origins only

## Caching Architecture

The extension uses **chrome.storage as a cache** to avoid frequent API calls:

- **Database**: Stores locked sites list (without state)
- **Cache**: Stores locked sites with state (0=locked, 1=unlocked)  
- **Cache TTL**: 5 minutes (configurable in `cache.js`)
- **State Management**: State is only in cache, never in database

### Benefits:
- ✅ Reduced API calls (cache valid for 5 minutes)
- ✅ Faster response times (local storage)
- ✅ State changes don't require DB writes
- ✅ Automatic cache invalidation on DB changes

### How It Works:
1. First request: Cache miss → Fetch from API → Store in cache
2. Subsequent requests: Check cache → If valid, return cached data
3. Cache expired: Fetch from API → Update cache
4. State updates: Only update cache (state not stored in DB)
5. Add/Remove sites: Update both DB and cache

See `CACHE_USAGE.md` for detailed usage examples.

## Database Schema

- **users**: id, email, password_hash, pin, created_at, updated_at
- **locked_sites**: id, user_id, site, created_at, updated_at
  - **Note**: `state` column is NOT in database, only in chrome.storage cache

## Deployment

For production:
1. Deploy the server to a cloud provider (Heroku, Railway, etc.)
2. Update `API_BASE_URL` in the extension
3. Set proper CORS origins
4. Use environment variables for all secrets
5. Run migration to remove state column if upgrading: `node server/migrations/remove_state_column.js`

