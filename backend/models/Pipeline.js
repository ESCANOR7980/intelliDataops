const mongoose = require('mongoose');

const PipelineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sourceDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  targetDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  dataSource: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSource' },
  status: { type: String, enum: ['active', 'paused', 'error', 'draft'], default: 'draft' },
  transformations: [{
    type: { type: String, enum: ['filter', 'map', 'aggregate', 'anonymize', 'encrypt', 'validate', 'join', 'deduplicate'] },
    config: mongoose.Schema.Types.Mixed,
    order: Number,
    description: String
  }],
  schedule: {
    type: { type: String, enum: ['manual', 'interval', 'cron'], default: 'manual' },
    interval: Number,
    cronExpression: String,
    nextRun: Date
  },
  privacy: {
    anonymizeFields: [String],
    encryptFields: [String],
    maskFields: [String],
    retentionDays: { type: Number, default: 365 }
  },
  stats: {
    totalRuns: { type: Number, default: 0 },
    successfulRuns: { type: Number, default: 0 },
    failedRuns: { type: Number, default: 0 },
    totalRecordsProcessed: { type: Number, default: 0 },
    lastRunAt: Date,
    lastRunStatus: String,
    avgProcessingTime: Number
  },
  blockchainHash: String,
  complianceLevel: { type: String, enum: ['basic', 'standard', 'strict'], default: 'standard' },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Pipeline', PipelineSchema);