import mongoose, { Document, Model } from 'mongoose';

// Chapter interface
export interface IChapter extends Document {
  title: string;
  chapterNumber: number;
  volume: number;
  manga: mongoose.Types.ObjectId;
  pages: Array<{
    pageNumber: number;
    imageUrl: string;
    width: number;
    height: number;
  }>;
  views: number;
  isDeleted: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Chapter schema
const ChapterSchema = new mongoose.Schema<IChapter>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  chapterNumber: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    default: 1
  },
  manga: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manga',
    required: true
  },
  pages: [{
    pageNumber: {
      type: Number,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 1200
    }
  }],
  views: {
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

// Pre-save middleware to only update updatedAt for actual content changes
ChapterSchema.pre('save', function(next) {
  // Only update updatedAt if it's a new document or if content fields have changed
  if (this.isNew || 
      this.isModified('title') || 
      this.isModified('chapterNumber') || 
      this.isModified('volume') || 
      this.isModified('pages') || 
      this.isModified('isDeleted') || 
      this.isModified('userId')) {
    this.updatedAt = new Date();
  }
  next();
});

// Create indexes for better query performance
ChapterSchema.index({ manga: 1, chapterNumber: 1 });
ChapterSchema.index({ manga: 1, createdAt: -1 });
ChapterSchema.index({ userId: 1 });

// Export the model with proper typing
const Chapter: Model<IChapter> = mongoose.models.Chapter || mongoose.model<IChapter>('Chapter', ChapterSchema);

export default Chapter;
