# Cache Usage Guide

## Architecture

- **Database (Aiven)**: Stores users and locked sites (without state)
- **Chrome Storage Cache**: Stores locked sites with state (0=locked, 1=unlocked)
- **Cache TTL**: 5 minutes (configurable in `cache.js`)

## How It Works

1. **First Request**: Cache miss → Fetch from API → Store in cache with timestamp
2. **Subsequent Requests**: Check cache → If valid (< 5 min old), return cached data
3. **Cache Expired**: Fetch from API → Update cache
4. **State Updates**: Only update cache (state not stored in DB)
5. **Add/Remove Sites**: Update both DB and cache

## Usage Examples

### Initialize Cache Service

```javascript
// In popup.js, content.js, or lock.js
const cache = getCacheService(apiService);
```

### Get Locked Sites (with caching)

```javascript
// Automatically uses cache if valid, otherwise fetches from API
const sites = await cache.getLockedSites(email);
// Returns: [{ site: 'example.com', state: 0 }, ...]
```

### Get Site State

```javascript
const siteInfo = await cache.getSiteState(email, 'example.com');
// Returns: { isLocked: true, state: 0, siteData: { site: 'example.com', state: 0 } }
```

### Update Site State (cache only)

```javascript
// Updates cache, state not stored in DB
await cache.updateSiteState(email, 'example.com', 1);
```

### Add Locked Site (DB + cache)

```javascript
// Adds to DB and updates cache
await cache.addLockedSite(email, 'example.com');
```

### Remove Locked Site (DB + cache)

```javascript
// Removes from DB and updates cache
await cache.removeLockedSite(email, 'example.com');
```

### Force Cache Refresh

```javascript
// Invalidates cache and fetches fresh data from API
await cache.refreshCache(email);
```

## Cache Keys

- `cached_locked_sites_{email}` - Cached sites array
- `cache_timestamp_{email}` - Cache timestamp for TTL check

## Benefits

1. **Reduced API Calls**: Cache valid for 5 minutes
2. **Faster Response**: Local storage is instant
3. **Offline Support**: Falls back to stale cache if API fails
4. **State Management**: State (0/1) only in cache, not DB
5. **Automatic Sync**: Cache updated when DB changes

## Migration from Direct API Calls

Replace:
```javascript
const sites = await apiService.getLockedSites(email);
```

With:
```javascript
const cache = getCacheService(apiService);
const sites = await cache.getLockedSites(email);
```

