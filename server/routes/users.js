import express from 'express';
import { body } from 'express-validator';
import User from '../models/User.js';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// @route   POST /api/users/setup
// @desc    Complete onboarding registration
// @access  Private
router.post(
  '/setup',
  protect,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('age').isInt({ min: 18, max: 100 }).withMessage('Must be 18 or older'),
    body('gender').notEmpty().withMessage('Gender is required'),
    body('branch').notEmpty().withMessage('Branch is required'),
    body('year').notEmpty().withMessage('Year is required'),
    body('intent').custom((val) => {
      if (Array.isArray(val)) return val.length > 0;
      return typeof val === 'string' && val.trim() !== '';
    }).withMessage('At least one connection intent is required'),
  ],
  validate,
  async (req, res) => {
    const {
      name,
      age,
      gender,
      pronouns,
      branch,
      year,
      hostel,
      bio,
      prompts,
      photos,
      intent,
      interestedIn,
      interests,
    } = req.body;

    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.name = name;
      user.age = age;
      user.gender = gender;
      user.pronouns = pronouns || '';
      user.branch = branch;
      user.year = year;
      user.hostel = hostel || '';
      user.bio = bio || '';
      user.prompts = prompts || [];
      user.photos = photos || [];
      user.intent = intent;
      user.interestedIn = interestedIn || [];
      user.interests = interests || [];
      user.isOnboarded = true;

      await user.save();

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during onboarding setup' });
    }
  }
);

// @route   GET /api/users/profile
// @desc    Get user's own profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile details
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const {
    name,
    gender,
    pronouns,
    branch,
    year,
    bio,
    prompts,
    photos,
    intent,
    interestedIn,
    ageRange,
    interests,
    hostel,
  } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (gender) user.gender = gender;
    if (pronouns !== undefined) user.pronouns = pronouns;
    if (branch) user.branch = branch;
    if (year) user.year = year;
    if (bio !== undefined) user.bio = bio;
    if (prompts) user.prompts = prompts;
    if (photos) user.photos = photos;
    if (intent) user.intent = intent;
    if (interestedIn) user.interestedIn = interestedIn;
    if (ageRange) user.ageRange = ageRange;
    if (interests) user.interests = interests;
    if (hostel !== undefined) user.hostel = hostel;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account and all matches/messages
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete matches involving user
    const matches = await Match.find({ users: userId });
    const matchIds = matches.map((m) => m._id);

    // Delete messages in those matches
    await Message.deleteMany({ matchId: { $in: matchIds } });

    // Delete the matches themselves
    await Match.deleteMany({ users: userId });

    // Delete User
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
});

export default router;
