import mongoose, { Document, Model } from 'mongoose';

// Manga interface
export interface IManga extends Document {
  title: string;
  description: string;
  coverImage: string;
  genres: string[];
  author: string;
  artist: string;
  status: 'ongoing' | 'completed';
  type: string;
  views: number;
  chaptersCount: number;
  likes: number;
  dislikes: number;
  isDeleted: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Manga schema
const MangaSchema = new mongoose.Schema<IManga>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  genres: [{
    type: String,
    trim: true
  }],
  author: {
    type: String,
    trim: true
  },
  artist: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed'],
    default: 'ongoing'
  },
  type: {
    type: String,
    default: 'manga'
  },
  views: {
    type: Number,
    default: 0
  },
  chaptersCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
MangaSchema.index({ title: 'text', description: 'text' });
MangaSchema.index({ views: -1 });
MangaSchema.index({ createdAt: -1 });
MangaSchema.index({ updatedAt: -1 });
MangaSchema.index({ userId: 1 });

// Export the model with proper typing
const Manga: Model<IManga> = mongoose.models.Manga || mongoose.model<IManga>('Manga', MangaSchema);

export default Manga;
