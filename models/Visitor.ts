import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVisitor extends Document {
  ip: string;
  userAgent: string;
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  firstVisit: Date;
  lastVisit: Date;
  visitCount: number;
  pagesViewed: string[];
  referrer?: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser?: string;
  os?: string;
  isUnique: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema = new Schema<IVisitor>({
  ip: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    required: true
  },
  country: String,
  city: String,
  region: String,
  timezone: String,
  firstVisit: {
    type: Date,
    default: Date.now
  },
  lastVisit: {
    type: Date,
    default: Date.now
  },
  visitCount: {
    type: Number,
    default: 1
  },
  pagesViewed: [{
    type: String
  }],
  referrer: String,
  deviceType: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet'],
    required: true
  },
  browser: String,
  os: String,
  isUnique: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
VisitorSchema.index({ ip: 1, userAgent: 1 });

// Index for analytics queries
VisitorSchema.index({ createdAt: 1 });
VisitorSchema.index({ lastVisit: 1 });
VisitorSchema.index({ country: 1 });
VisitorSchema.index({ deviceType: 1 });

const Visitor: Model<IVisitor> = mongoose.models.Visitor || mongoose.model<IVisitor>('Visitor', VisitorSchema);

export default Visitor;
