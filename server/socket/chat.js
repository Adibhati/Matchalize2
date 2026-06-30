import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';

export const socketHandler = (io) => {
  // Middleware to authenticate socket connections
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
    console.log(`User connected to socket: ${socket.user.name} (${socket.user._id})`);

    // Join match chat room
    socket.on('join-match', (matchId) => {
      socket.join(matchId);
      console.log(`User ${socket.user.name} joined room: ${matchId}`);
    });

    // Handle typing status
    socket.on('typing', (matchId) => {
      socket.to(matchId).emit('typing', {
        userId: socket.user._id,
        name: socket.user.name,
      });
    });

    socket.on('stop-typing', (matchId) => {
      socket.to(matchId).emit('stop-typing', {
        userId: socket.user._id,
      });
    });

    // Handle marking messages as read
    socket.on('read-messages', async ({ matchId }) => {
      try {
        await Message.updateMany(
          { matchId, sender: { $ne: socket.user._id }, readAt: null },
          { $set: { readAt: new Date() } }
        );
        
        // Notify the other user in the room that messages were read
        socket.to(matchId).emit('messages-read', {
          readerId: socket.user._id,
        });
      } catch (err) {
        console.error('Error marking messages as read via socket:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected from socket: ${socket.user.name}`);
    });
  });
};
