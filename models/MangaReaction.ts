import mongoose, { Document, Model } from 'mongoose';

// Manga reaction interface
export interface IMangaReaction extends Document {
  userId: mongoose.Types.ObjectId;
  mangaId: mongoose.Types.ObjectId;
  reaction: 'like' | 'dislike';
  createdAt: Date;
  updatedAt: Date;
}

// Manga reaction schema
const MangaReactionSchema = new mongoose.Schema<IMangaReaction>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mangaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manga',
    required: true
  },
  reaction: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  }
}, {
  timestamps: true
});

// Create compound index to ensure one reaction per user per manga
MangaReactionSchema.index({ userId: 1, mangaId: 1 }, { unique: true });
MangaReactionSchema.index({ mangaId: 1, reaction: 1 });

// Export the model with proper typing
const MangaReaction: Model<IMangaReaction> = mongoose.models.MangaReaction || mongoose.model<IMangaReaction>('MangaReaction', MangaReactionSchema);

export default MangaReaction;
