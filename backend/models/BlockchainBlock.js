const mongoose = require('mongoose');

const BlockchainBlockSchema = new mongoose.Schema({
  blockNumber: { type: Number, required: true, unique: true },
  previousHash: { type: String, required: true },
  hash: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  nonce: { type: Number, default: 0 },
  data: {
    type: { type: String, enum: ['data_transfer', 'policy_update', 'access_grant', 'audit_log', 'pipeline_run', 'schema_change'] },
    pipelineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline' },
    sourceDept: String,
    targetDept: String,
    recordCount: Number,
    dataHash: String,
    transformations: [String],
    metadata: mongoose.Schema.Types.Mixed
  },
  validator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isValid: { type: Boolean, default: true },
  merkleRoot: String,
  difficulty: { type: Number, default: 2 }
}, { timestamps: true });

module.exports = mongoose.model('BlockchainBlock', BlockchainBlockSchema);