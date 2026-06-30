import express from 'express';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/messages/:matchId
// @desc    Get all messages for a specific match (paginated)
// @access  Private
router.get('/:matchId', protect, async (req, res) => {
  const { matchId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;

  try {
    // Verify user belongs to the match
    const match = await Match.findOne({
      _id: matchId,
      users: req.user._id,
      isActive: true,
    });

    if (!match) {
      return res.status(403).json({ message: 'Unauthorized or match inactive' });
    }

    const total = await Message.countDocuments({ matchId });

    // Fetch messages
    const messages = await Message.find({ matchId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Mark messages from other user as read
    await Message.updateMany(
      { matchId, sender: { $ne: req.user._id }, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.status(200).json({
      messages: messages.reverse(),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// @route   POST /api/messages/:matchId
// @desc    Send a message
// @access  Private
router.post('/:matchId', protect, async (req, res) => {
  const { matchId } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ message: 'Message text cannot be empty' });
  }

  try {
    // Verify user belongs to the match
    const match = await Match.findOne({
      _id: matchId,
      users: req.user._id,
      isActive: true,
    });

    if (!match) {
      return res.status(403).json({ message: 'Unauthorized or match inactive' });
    }

    // Create and save message
    const message = await Message.create({
      matchId,
      sender: req.user._id,
      text: text.trim(),
    });

    // Touch Match to update updatedAt timestamp
    match.updatedAt = new Date();
    await match.save();

    // Emit message to Socket.io room if available
    const io = req.app.get('io');
    if (io) {
      io.to(matchId.toString()).emit('new-message', message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

export default router;
