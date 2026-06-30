import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly query matches for a user
matchSchema.index({ users: 1, isActive: 1 });

// Unique compound index to prevent duplicate matches between the same two users
matchSchema.index({ users: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

const Match = mongoose.model('Match', matchSchema);
export default Match;
