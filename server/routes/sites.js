const express = require('express');
const router = express.Router();
const LockedSite = require('../models/LockedSite');
const User = require('../models/User');

// Middleware to get user ID from email
async function getUserFromEmail(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.userId = user.id;
    req.userEmail = user.email;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all locked sites for a user
router.post('/list', getUserFromEmail, async (req, res) => {
  try {
    const sites = await LockedSite.findByUser(req.userId);
    res.json({ sites });
  } catch (error) {
    console.error('Get sites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get site state (checks if site exists in DB, state comes from cache)
router.post('/state', getUserFromEmail, async (req, res) => {
  try {
    const { site } = req.body;
    if (!site) {
      return res.status(400).json({ error: 'Site is required' });
    }

    const siteData = await LockedSite.findByUserAndSite(req.userId, site);
    if (!siteData) {
      return res.json({ isLocked: false, state: null });
    }

    // Site exists in DB, but state is managed in chrome.storage cache
    res.json({ 
      isLocked: true,
      siteData: { site: siteData.site }
    });
  } catch (error) {
    console.error('Get site state error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add locked site
router.post('/add', getUserFromEmail, async (req, res) => {
  try {
    const { site } = req.body;
    if (!site) {
      return res.status(400).json({ error: 'Site is required' });
    }

    const exists = await LockedSite.exists(req.userId, site);
    if (exists) {
      return res.status(409).json({ error: 'Site already locked' });
    }

    const lockedSite = await LockedSite.create(req.userId, site);
    res.status(201).json({ 
      message: 'Site locked successfully',
      site: { site: lockedSite.site }
    });
  } catch (error) {
    console.error('Add site error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Note: State updates are handled in chrome.storage cache, not in database
// This endpoint is kept for compatibility but doesn't modify DB
router.post('/update-state', getUserFromEmail, async (req, res) => {
  try {
    const { site, state } = req.body;
    if (!site || state === undefined) {
      return res.status(400).json({ error: 'Site and state are required' });
    }

    // Verify site exists in DB
    const siteData = await LockedSite.findByUserAndSite(req.userId, site);
    if (!siteData) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // State is managed in chrome.storage cache, just confirm site exists
    res.json({ 
      message: 'Site state should be updated in cache',
      site: { site: siteData.site }
    });
  } catch (error) {
    console.error('Update state error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove locked site
router.post('/remove', getUserFromEmail, async (req, res) => {
  try {
    const { site } = req.body;
    if (!site) {
      return res.status(400).json({ error: 'Site is required' });
    }

    const deleted = await LockedSite.delete(req.userId, site);
    if (!deleted) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json({ message: 'Site removed successfully' });
  } catch (error) {
    console.error('Remove site error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

