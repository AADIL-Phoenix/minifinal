const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/profile-photos')); // Fixed path
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Define higher-level routes first
// Search users
router.get('/search', protect, async (req, res) => {
  console.log('Search route hit:', req.query);
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'readingPreferences.genres': { $regex: query, $options: 'i' } }
      ]
    }).select('name profilePhoto readingPreferences');

    console.log('Search results:', users.length);
    res.json(users);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Parameterized routes after specific routes
// Get user profile by ID
router.get('/:id([0-9a-fA-F]{24})', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name profilePhoto')
      .populate('following', 'name profilePhoto');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get suggested users
router.get('/:id/suggested', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find users with similar reading preferences
    const suggestedUsers = await User.find({
      _id: { $ne: req.params.id },
      'readingPreferences.genres': { 
        $in: user.readingPreferences.genres 
      }
    })
    .select('name profilePhoto readingPreferences')
    .limit(5);

    res.json(suggestedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Follow user
router.post('/:id/follow', protect, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user.id);

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: 'Successfully followed user' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unfollow user
router.post('/:id/unfollow', protect, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== req.params.id
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.user.id
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: 'Successfully unfollowed user' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update reading preferences
router.post('/:id/reading-preferences', protect, async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { genre } = req.body;
    if (!genre) {
      return res.status(400).json({ message: 'Genre is required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.readingPreferences.genres.includes(genre)) {
      user.readingPreferences.genres.push(genre);
      await user.save();
    }

    res.json(user.readingPreferences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile photo
router.post('/:id/photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePhoto = `/uploads/profile-photos/${req.file.filename}`;
    await user.save();

    res.json({ photoUrl: user.profilePhoto });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
