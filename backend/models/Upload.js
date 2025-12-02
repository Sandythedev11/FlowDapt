const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['csv', 'excel', 'json', 'pdf'],
    },
    fileSize: {
      type: Number,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    summary: {
      totalRows: Number,
      totalColumns: Number,
      columnNames: [String],
      dataTypes: mongoose.Schema.Types.Mixed,
    },
    statistics: {
      numericColumns: mongoose.Schema.Types.Mixed,
      categoricalColumns: mongoose.Schema.Types.Mixed,
    },
    insights: {
      missingValues: mongoose.Schema.Types.Mixed,
      duplicateRows: Number,
      outliers: mongoose.Schema.Types.Mixed,
      correlations: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    errorMessage: String,
    // Session-based: files are temporary and cleared on logout
    sessionBased: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user queries
uploadSchema.index({ user: 1 });

module.exports = mongoose.model('Upload', uploadSchema);
