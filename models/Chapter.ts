import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  chapterNumber: {
    type: Number,
    required: true
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

// Create indexes for better query performance
ChapterSchema.index({ manga: 1, chapterNumber: 1 });
ChapterSchema.index({ manga: 1, createdAt: -1 });
ChapterSchema.index({ userId: 1 });

export default mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema);
