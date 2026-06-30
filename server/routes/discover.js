import express from 'express';
import User from '../models/User.js';
import Match from '../models/Match.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/discover
// @desc    Get discover deck for the user (paginated)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const currentUser = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (req.query.reset === 'true') {
      currentUser.liked = [];
      currentUser.passed = [];
      await currentUser.save();
    }

    // Build filter query
    const filter = {
      _id: { $ne: currentUser._id }, // Not self
      isOnboarded: true,             // Onboarded users only
      isVerified: true,              // Verified users only
      collegeCode: currentUser.collegeCode, // Same college
    };

    // Exclude already liked or passed users
    const excludedIds = [...(currentUser.liked || []), ...(currentUser.passed || [])];
    if (excludedIds.length > 0) {
      filter._id.$nin = excludedIds;
    }

    // Gender interest filter (mutual compatibility)
    // 1. Other user's gender should match what current user is interested in
    if (currentUser.interestedIn && currentUser.interestedIn.length > 0) {
      filter.gender = { $in: currentUser.interestedIn };
    }

    // Age filter
    const minAge = currentUser.ageRange?.min || 18;
    const maxAge = currentUser.ageRange?.max || 30;
    filter.age = { $gte: minAge, $lte: maxAge };

    const total = await User.countDocuments(filter);

    // Fetch potential matches
    let potentialMatches = await User.find(filter)
      .select('-liked -passed -createdAt -updatedAt -__v -email -isVerified')
      .sort({ lastActive: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Dynamic filtering for mutual gender interest (does the other user like the current user's gender?)
    potentialMatches = potentialMatches.filter((otherUser) => {
      // If the other user hasn't specified interests, default to true
      if (!otherUser.interestedIn || otherUser.interestedIn.length === 0) {
        return true;
      }
      return otherUser.interestedIn.includes(currentUser.gender);
    });

    res.status(200).json({
      users: potentialMatches,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching discovery deck' });
  }
});

// @route   POST /api/discover/like/:id
// @desc    Like a user (swipe right)
// @access  Private
router.post('/like/:id', protect, async (req, res) => {
  const targetId = req.params.id;
  const currentUser = req.user;

  try {
    const targetUser = await User.findById(targetId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add to liked array if not already present
    if (!currentUser.liked.includes(targetId)) {
      currentUser.liked.push(targetId);
      await currentUser.save();
    }

    // Check if it's a mutual like
    const isMutual = targetUser.liked.includes(currentUser._id);

    if (isMutual) {
      // Check if match already exists
      let match = await Match.findOne({
        users: { $all: [currentUser._id, targetId] },
      });

      const io = req.app.get('io');
      const isNewMatch = !match;

      if (!match) {
        match = await Match.create({
          users: [currentUser._id, targetId],
        });
      } else {
        match.isActive = true;
        await match.save();
      }

      if (io) {
        const room1 = targetId.toString();
        io.to(room1).emit('match-notification', {
          name: currentUser.name,
          matchId: match._id,
        });
      }

      return res.status(200).json({
        matched: true,
        matchId: match._id,
        user: {
          _id: targetUser._id,
          name: targetUser.name,
          photos: targetUser.photos,
        },
      });
    }

    res.status(200).json({ matched: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error processing like' });
  }
});

// @route   POST /api/discover/superlike/:id
// @desc    Super like a user
// @access  Private
router.post('/superlike/:id', protect, async (req, res) => {
  const targetId = req.params.id;
  const currentUser = req.user;

  try {
    const targetUser = await User.findById(targetId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!currentUser.liked.includes(targetId)) {
      currentUser.liked.push(targetId);
      await currentUser.save();
    }

    const isMutual = targetUser.liked.includes(currentUser._id);

    if (isMutual) {
      let match = await Match.findOne({
        users: { $all: [currentUser._id, targetId] },
      });

      if (!match) {
        match = await Match.create({
          users: [currentUser._id, targetId],
        });
      } else {
        match.isActive = true;
        await match.save();
      }

      return res.status(200).json({
        matched: true,
        super: true,
        matchId: match._id,
        user: {
          _id: targetUser._id,
          name: targetUser.name,
          photos: targetUser.photos,
        },
      });
    }

    res.status(200).json({ matched: false, super: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error processing super like' });
  }
});

// @route   POST /api/discover/pass/:id
// @desc    Pass on a user (swipe left)
// @access  Private
router.post('/pass/:id', protect, async (req, res) => {
  const targetId = req.params.id;
  const currentUser = req.user;

  try {
    // Add to passed array if not already present
    if (!currentUser.passed.includes(targetId)) {
      currentUser.passed.push(targetId);
      await currentUser.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error processing pass' });
  }
});

export default router;
