const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  ministry: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: ['health', 'finance', 'education', 'transport', 'agriculture', 'social', 'security', 'environment', 'other'],
    default: 'other'
  },
  contactEmail: { type: String },
  apiEndpoint: { type: String },
  isActive: { type: Boolean, default: true },
  dataClassification: { type: String, enum: ['public', 'internal', 'confidential', 'restricted'], default: 'internal' },
  interopScore: { type: Number, default: 0, min: 0, max: 100 },
  totalRecords: { type: Number, default: 0 },
  lastSync: { type: Date },
  color: { type: String, default: '#3B82F6' },
  icon: { type: String, default: '🏛️' }
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);