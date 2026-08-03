const mongoose = require('mongoose');

const DataSourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  type: { type: String, enum: ['REST_API', 'GraphQL', 'Database', 'CSV', 'JSON', 'XML', 'SOAP'], required: true },
  connectionConfig: {
    url: String,
    method: { type: String, enum: ['GET', 'POST', 'PUT'], default: 'GET' },
    headers: mongoose.Schema.Types.Mixed,
    authType: { type: String, enum: ['none', 'apikey', 'bearer', 'basic', 'oauth2'], default: 'none' },
    authValue: String,
    dbType: String,
    dbName: String
  },
  schema: [{
    fieldName: String,
    dataType: String,
    required: Boolean,
    pii: Boolean,
    description: String
  }],
  status: { type: String, enum: ['active', 'inactive', 'error', 'pending'], default: 'pending' },
  dataClassification: { type: String, enum: ['public', 'internal', 'confidential', 'restricted'], default: 'internal' },
  refreshRate: { type: Number, default: 60 }, // minutes
  lastFetched: { type: Date },
  recordCount: { type: Number, default: 0 },
  qualityScore: { type: Number, default: 0, min: 0, max: 100 },
  tags: [String],
  description: String,
  sampleData: mongoose.Schema.Types.Mixed,
  errorLog: [{
    timestamp: { type: Date, default: Date.now },
    message: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('DataSource', DataSourceSchema);