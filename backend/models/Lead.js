const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\d{10}$/, 'Phone must be a valid 10-digit number'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    location: {
      type: String,
      required: [true, 'Location/City is required'],
      trim: true,
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: {
        values: ['Residential', 'Commercial', 'Industrial'],
        message: 'Property type must be Residential, Commercial, or Industrial',
      },
    },
    systemSize: {
      type: Number,
      required: [true, 'Estimated system size is required'],
      min: [1, 'System size must be at least 1 kW'],
      max: [100, 'System size cannot exceed 100 kW'],
    },
    source: {
      type: String,
      required: [true, 'Lead source is required'],
      enum: {
        values: ['Website', 'Referral', 'Walk-in', 'Social Media'],
        message: 'Invalid source value',
      },
    },
    status: {
      type: String,
      default: 'New Lead',
      enum: {
        values: ['New Lead', 'Contacted', 'Site Visit Scheduled', 'Proposal Sent', 'Won', 'Lost'],
        message: 'Invalid status value',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true, // auto creates createdAt and updatedAt
  }
);

// Index frequently queried fields
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ location: 1 });
leadSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Lead', leadSchema);
