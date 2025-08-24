import mongoose from 'mongoose';

const MangaSchema = new mongoose.Schema({
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

export default mongoose.models.Manga || mongoose.model('Manga', MangaSchema);
