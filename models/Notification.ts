import mongoose, { Document, Model } from 'mongoose';

// Notification interface
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'new_comment' | 'comment_reply' | 'like' | 'unlike' | 'manga_comment';
  title: string;
  message: string;
  data: {
    mangaId?: mongoose.Types.ObjectId;
    chapterId?: mongoose.Types.ObjectId;
    commentId?: mongoose.Types.ObjectId;
    fromUser?: mongoose.Types.ObjectId;
  };
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Notification schema
const NotificationSchema = new mongoose.Schema<INotification>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['new_comment', 'comment_reply', 'like', 'unlike', 'manga_comment']
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

// Export the model with proper typing
const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
