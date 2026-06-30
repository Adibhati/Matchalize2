import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Match from '../models/Match.js';
import Message from '../models/Message.js';

const onlineUsers = new Map(); // userId -> Set<socketId>

export const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`User connected: ${socket.user.name} (${userId})`);

    // Multi-device support: track all socket IDs per user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    User.findByIdAndUpdate(userId, { lastActive: new Date() }).exec()
      .catch(err => console.error('Failed to update lastActive:', err));

    socket.on('join-match', async (matchId) => {
      if (!matchId || typeof matchId !== 'string') return;

      // Validate match membership
      try {
        const match = await Match.findOne({ _id: matchId, users: userId, isActive: true });
        if (!match) return socket.emit('error', { message: 'Not authorized for this match' });
      } catch (err) {
        console.error('join-match validation error:', err);
        return;
      }

      socket.join(matchId);
      io.to(matchId).emit('online-update', {
        userId,
        online: true,
        lastActive: new Date().toISOString(),
      });
    });

    socket.on('typing', (matchId) => {
      if (!matchId || typeof matchId !== 'string') return;
      socket.to(matchId).emit('typing', {
        userId,
        name: socket.user.name,
      });
    });

    socket.on('stop-typing', (matchId) => {
      if (!matchId || typeof matchId !== 'string') return;
      socket.to(matchId).emit('stop-typing', { userId });
    });

    socket.on('read-messages', async ({ matchId }) => {
      if (!matchId || typeof matchId !== 'string') return;

      // Validate match membership
      try {
        const match = await Match.findOne({ _id: matchId, users: userId, isActive: true });
        if (!match) return;

        await Message.updateMany(
          { matchId, sender: { $ne: userId }, readAt: null },
          { $set: { readAt: new Date() } }
        );
        socket.to(matchId).emit('messages-read', { readerId: userId });
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    });

    socket.on('check-online', async ({ matchId, targetUserId }) => {
      try {
        const isOnline = onlineUsers.has(targetUserId) && onlineUsers.get(targetUserId).size > 0;
        const targetUser = await User.findById(targetUserId).select('lastActive');
        socket.emit('online-status', {
          userId: targetUserId,
          online: isOnline,
          lastActive: targetUser?.lastActive,
        });
      } catch (err) {
        console.error('check-online error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);

      // Multi-device: remove this socket, keep others
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) onlineUsers.delete(userId);
      }

      User.findByIdAndUpdate(userId, { lastActive: new Date() }).exec()
        .catch(err => console.error('Failed to update lastActive:', err));

      // Only emit offline if no other sockets for this user
      const stillOnline = onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
      if (!stillOnline) {
        for (const [room] of socket.rooms) {
          if (room !== socket.id) {
            io.to(room).emit('online-update', {
              userId,
              online: false,
              lastActive: new Date().toISOString(),
            });
          }
        }
      }
    });
  });
};
