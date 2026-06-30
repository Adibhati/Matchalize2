import express from 'express';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:matchId', protect, async (req, res) => {
  const { matchId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100);

  try {
    const match = await Match.findOne({
      _id: matchId,
      users: req.user._id,
      isActive: true,
    });

    if (!match) {
      return res.status(403).json({ message: 'Unauthorized or match inactive' });
    }

    const total = await Message.countDocuments({ matchId });

    const messages = await Message.find({ matchId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('replyTo', 'text sender type image deleted');

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

router.post('/:matchId', protect, async (req, res) => {
  const { matchId } = req.params;
  const { text, type, image, replyTo } = req.body;

  if (type === 'image' && image) {
    // image-only messages are fine
  } else if (!text || text.trim() === '') {
    return res.status(400).json({ message: 'Message cannot be empty' });
  }

  if (text && text.length > 5000) {
    return res.status(400).json({ message: 'Message too long (max 5000 characters)' });
  }

  try {
    const match = await Match.findOne({
      _id: matchId,
      users: req.user._id,
      isActive: true,
    });

    if (!match) {
      return res.status(403).json({ message: 'Unauthorized or match inactive' });
    }

    // Dedup: check for duplicate within 2 seconds
    if (text && text.trim()) {
      const recentDuplicate = await Message.findOne({
        matchId,
        sender: req.user._id,
        text: text.trim(),
        createdAt: { $gte: new Date(Date.now() - 2000) },
      });
      if (recentDuplicate) {
        return res.status(201).json(recentDuplicate);
      }
    }

    // Validate replyTo belongs to this match
    if (replyTo) {
      const replyMsg = await Message.findOne({ _id: replyTo, matchId });
      if (!replyMsg) {
        return res.status(400).json({ message: 'Reply target not found in this match' });
      }
    }

    const messageData = {
      matchId,
      sender: req.user._id,
      type: type || 'text',
    };

    if (text && text.trim()) messageData.text = text.trim();
    if (image) messageData.image = image;
    if (replyTo) messageData.replyTo = replyTo;

    const message = await Message.create(messageData);

    const populated = await Message.findById(message._id)
      .populate('replyTo', 'text sender type image deleted');

    match.updatedAt = new Date();
    await match.save();

    const io = req.app.get('io');
    if (io) {
      io.to(matchId.toString()).emit('new-message', populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

router.post('/:matchId/reaction', protect, async (req, res) => {
  const { matchId } = req.params;
  const { msgId, emoji } = req.body;

  try {
    const match = await Match.findOne({
      _id: matchId,
      users: req.user._id,
      isActive: true,
    });

    if (!match) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const message = await Message.findOne({ _id: msgId, matchId });
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const existingIdx = message.reactions.findIndex(
      (r) => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingIdx > -1) {
      message.reactions.splice(existingIdx, 1);
    } else {
      message.reactions = message.reactions.filter(
        (r) => r.user.toString() !== req.user._id.toString()
      );
      message.reactions.push({ emoji, user: req.user._id });
    }

    await message.save();

    const io = req.app.get('io');
    if (io) {
      io.to(matchId.toString()).emit('reaction-update', {
        msgId: message._id,
        reactions: message.reactions,
      });
    }

    res.status(200).json({ reactions: message.reactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error reacting' });
  }
});

router.delete('/:matchId/:msgId', protect, async (req, res) => {
  const { matchId, msgId } = req.params;

  try {
    const match = await Match.findOne({
      _id: matchId,
      users: req.user._id,
      isActive: true,
    });

    if (!match) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const message = await Message.findOne({ _id: msgId, matchId });
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Can only delete your own messages' });
    }

    message.deleted = true;
    message.text = '';
    message.image = '';
    await message.save();

    const io = req.app.get('io');
    if (io) {
      io.to(matchId.toString()).emit('message-deleted', { msgId: message._id });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting message' });
  }
});

export default router;
