# Website Locker API Server

Backend API server for Website Locker Extension using Aiven PostgreSQL.

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure Aiven connection:**
   - Copy `.env.example` to `.env`
   - Fill in your Aiven PostgreSQL credentials:
     ```
     AIVEN_HOST=your-project.a.aivencloud.com
     AIVEN_PORT=12345
     AIVEN_DATABASE=defaultdb
     AIVEN_USER=avnadmin
     AIVEN_PASSWORD=your-password
     AIVEN_SSL_MODE=require
     ```

3. **Run database migrations:**
   ```bash
   npm run migrate
   ```

4. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-pin` - Verify unlock PIN

### Locked Sites
- `POST /api/sites/list` - Get all locked sites for user
- `POST /api/sites/state` - Get site lock state
- `POST /api/sites/add` - Add locked site
- `POST /api/sites/update-state` - Update site state (0=locked, 1=unlocked)
- `POST /api/sites/remove` - Remove locked site

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `pin` - Unlock PIN (4-6 digits)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Locked Sites Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `site` - Website hostname
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Note**: The `state` field is NOT stored in the database. State (0=locked, 1=unlocked) is managed in chrome.storage cache only. This reduces database writes and improves performance.

## Environment Variables

See `.env.example` for all required variables.

