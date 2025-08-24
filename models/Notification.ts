import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['new_comment', 'comment_reply', 'like', 'unlike']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    mangaId: mongoose.Schema.Types.ObjectId,
    chapterId: mongoose.Schema.Types.ObjectId,
    commentId: mongoose.Schema.Types.ObjectId,
    fromUser: mongoose.Schema.Types.ObjectId
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
