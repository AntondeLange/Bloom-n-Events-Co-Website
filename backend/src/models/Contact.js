import mongoose from 'mongoose';

/**
 * Contact Form Submission Schema
 * Stores contact form submissions from the website
 */
const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [100, 'First name cannot exceed 100 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [100, 'Last name cannot exceed 100 characters']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters'],
    default: null
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    maxlength: [255, 'Email cannot exceed 255 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [200, 'Message cannot exceed 200 characters']
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true,
    maxlength: [500, 'User agent string too long']
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  collection: 'contacts' // Explicit collection name
});

// Indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 }); // For sorting by date
contactSchema.index({ firstName: 1, lastName: 1 }); // For name searches

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON output
contactSchema.set('toJSON', { virtuals: true });
contactSchema.set('toObject', { virtuals: true });

export default mongoose.model('Contact', contactSchema);

