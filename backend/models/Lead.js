const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lead title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Converted', 'Lost'],
    default: 'New',
    required: true
  },
  value: {
    type: Number,
    required: [true, 'Lead value is required'],
    min: [0, 'Value cannot be negative']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  expectedCloseDate: {
    type: Date
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    content: {
      type: String,
      required: true,
      maxlength: [300, 'Note cannot be more than 300 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for filtering and search
leadSchema.index({ status: 1, customer: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ value: -1 });

module.exports = mongoose.model('Lead', leadSchema);
