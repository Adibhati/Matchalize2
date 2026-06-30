import express from 'express';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/matches
// @desc    Get all active matches for the current user with details (paginated)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Find active matches involving the current user
    const total = await Match.countDocuments({ users: userId, isActive: true });
    const matches = await Match.find({
      users: userId,
      isActive: true,
    })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
      path: 'users',
      select: 'name photos branch year lastActive gender hostel bio prompts intent interests',
    });

    const matchesWithLastMessage = await Promise.all(
      matches.map(async (match) => {
        // Filter out current user from the users array to get the matched user
        const otherUser = match.users.find(
          (user) => user._id.toString() !== userId.toString()
        );

        // Fetch last message for this match
        const lastMessage = await Message.findOne({ matchId: match._id })
          .sort({ createdAt: -1 })
          .select('text sender createdAt readAt');

        return {
          _id: match._id,
          user: otherUser,
          lastMessage,
          updatedAt: match.updatedAt,
        };
      })
    );

    // Sort matches by last message date, or match creation date if no messages
    matchesWithLastMessage.sort((a, b) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(a.updatedAt);
      const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(b.updatedAt);
      return dateB - dateA;
    });

    res.status(200).json({
      matches: matchesWithLastMessage,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching matches' });
  }
});

// @route   DELETE /api/matches/:id
// @desc    Unmatch/deactivate a match
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.id,
      users: req.user._id,
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    match.isActive = false;
    await match.save();

    res.status(200).json({ success: true, message: 'Unmatched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error processing unmatch' });
  }
});

export default router;
