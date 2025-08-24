import mongoose, { Document, Model } from 'mongoose';

// Manga interface
export interface IManga extends Document {
  title: string;
  description: string;
  coverImage: string;
  genres: string[];
  tags: string[];
  author: string;
  artist: string;
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  rating: number;
  views: number;
  chaptersCount: number;
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
  tags: [{
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
    enum: ['ongoing', 'completed', 'hiatus', 'cancelled'],
    default: 'ongoing'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  views: {
    type: Number,
    default: 0
  },
  chaptersCount: {
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
MangaSchema.index({ rating: -1 });
MangaSchema.index({ views: -1 });
MangaSchema.index({ createdAt: -1 });
MangaSchema.index({ updatedAt: -1 });
MangaSchema.index({ userId: 1 });

// Export the model with proper typing
const Manga: Model<IManga> = mongoose.models.Manga || mongoose.model<IManga>('Manga', MangaSchema);

export default Manga;
