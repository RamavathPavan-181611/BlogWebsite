import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['like', 'bookmark'],
      required: true
    }
  },
  { timestamps: true, collection: 'interactions' }
);

interactionSchema.index({ post: 1, user: 1, type: 1 }, { unique: true });
interactionSchema.index({ post: 1, type: 1 });
interactionSchema.index({ user: 1, type: 1, createdAt: -1 });

export default mongoose.model('Interaction', interactionSchema);