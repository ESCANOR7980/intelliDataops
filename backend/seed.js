const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const User = require('./models/User');
const Department = require('./models/Department');
const DataSource = require('./models/DataSource');
const Pipeline = require('./models/Pipeline');
const BlockchainBlock = require('./models/BlockchainBlock');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing old data...');

  await Promise.all([User.deleteMany(), Department.deleteMany(), DataSource.deleteMany(), Pipeline.deleteMany(), BlockchainBlock.deleteMany()]);

  // Departments
  const depts = await Department.insertMany([
    { name: 'Ministry of Health', code: 'MOH', ministry: 'Health & Family Welfare', category: 'health', description: 'National health data management', dataClassification: 'confidential', interopScore: 82, totalRecords: 45000, color: '#EF4444', icon: '🏥' },
    { name: 'Ministry of Finance', code: 'MOF', ministry: 'Finance', category: 'finance', description: 'Financial and taxation records', dataClassification: 'restricted', interopScore: 71, totalRecords: 120000, color: '#F59E0B', icon: '💰' },
    { name: 'Ministry of Education', code: 'MOE', ministry: 'Education', category: 'education', description: 'Student enrollment and academic records', dataClassification: 'internal', interopScore: 90, totalRecords: 88000, color: '#3B82F6', icon: '🎓' },
    { name: 'Ministry of Transport', code: 'MOT', ministry: 'Transport', category: 'transport', description: 'Vehicle and transport licensing data', dataClassification: 'public', interopScore: 65, totalRecords: 200000, color: '#8B5CF6', icon: '🚗' },
    { name: 'Ministry of Agriculture', code: 'MOA', ministry: 'Agriculture', category: 'agriculture', description: 'Farmer and crop data', dataClassification: 'public', interopScore: 55, totalRecords: 67000, color: '#10B981', icon: '🌾' },
    { name: 'Social Welfare Dept', code: 'SWD', ministry: 'Social Justice', category: 'social', description: 'Social welfare beneficiary data', dataClassification: 'confidential', interopScore: 78, totalRecords: 93000, color: '#F97316', icon: '🤝' },
  ]);

  // Admin User
  const admin = await User.create({
    name: 'Admin User', email: 'admin@intellidataops.gov', password: 'admin123',
    role: 'admin', department: depts[0]._id
  });

  const analyst = await User.create({
    name: 'Data Analyst', email: 'analyst@intellidataops.gov', password: 'analyst123',
    role: 'analyst', department: depts[1]._id
  });

  // Data Sources
  const sources = await DataSource.insertMany([
    { name: 'National Health Registry API', department: depts[0]._id, type: 'REST_API', status: 'active', qualityScore: 87, recordCount: 45000, description: 'Patient and hospital registry', connectionConfig: { url: 'https://api.health.gov.in/registry', method: 'GET', authType: 'apikey' }, schema: [{ fieldName: 'patient_id', dataType: 'string', required: true, pii: false }, { fieldName: 'age', dataType: 'integer', required: true, pii: false }, { fieldName: 'district', dataType: 'string', required: true, pii: false }, { fieldName: 'diagnosis_code', dataType: 'string', required: false, pii: false }, { fieldName: 'name', dataType: 'string', required: true, pii: true }], tags: ['health', 'patients', 'registry'] },
    { name: 'GST Returns Database', department: depts[1]._id, type: 'Database', status: 'active', qualityScore: 95, recordCount: 120000, description: 'GST filing and compliance data', connectionConfig: { url: 'mongodb://finance-db:27017', authType: 'basic', dbType: 'MongoDB', dbName: 'gst_returns' }, schema: [{ fieldName: 'gstin', dataType: 'string', required: true, pii: false }, { fieldName: 'turnover', dataType: 'number', required: true, pii: false }, { fieldName: 'state', dataType: 'string', required: true, pii: false }], tags: ['finance', 'gst', 'tax'] },
    { name: 'Student Enrollment CSV', department: depts[2]._id, type: 'CSV', status: 'active', qualityScore: 78, recordCount: 88000, description: 'Annual school enrollment data', connectionConfig: { url: 'https://data.education.gov.in/enrollment.csv', authType: 'none' }, schema: [{ fieldName: 'school_id', dataType: 'string', required: true, pii: false }, { fieldName: 'district', dataType: 'string', required: true, pii: false }, { fieldName: 'enrollment_count', dataType: 'integer', required: true, pii: false }], tags: ['education', 'schools'] },
    { name: 'Vehicle Registration API', department: depts[3]._id, type: 'REST_API', status: 'active', qualityScore: 91, recordCount: 200000, description: 'Vehicle and license data', connectionConfig: { url: 'https://api.vahan.gov.in/vehicles', method: 'GET', authType: 'bearer' }, schema: [{ fieldName: 'reg_number', dataType: 'string', required: true, pii: false }, { fieldName: 'vehicle_type', dataType: 'string', required: true, pii: false }, { fieldName: 'state', dataType: 'string', required: true, pii: false }, { fieldName: 'owner_name', dataType: 'string', required: false, pii: true }], tags: ['transport', 'vehicles'] },
    { name: 'PM-KISAN Beneficiary Feed', department: depts[4]._id, type: 'JSON', status: 'active', qualityScore: 72, recordCount: 67000, description: 'Farmer welfare scheme data', connectionConfig: { url: 'https://api.agriculture.gov.in/pmkisan', authType: 'apikey' }, schema: [{ fieldName: 'farmer_id', dataType: 'string', required: true, pii: false }, { fieldName: 'land_area', dataType: 'number', required: true, pii: false }, { fieldName: 'crop_type', dataType: 'string', required: false, pii: false }, { fieldName: 'district', dataType: 'string', required: true, pii: false }], tags: ['agriculture', 'farmers'] },
  ]);

  // Pipelines
  const pipelines = await Pipeline.insertMany([
    {
      name: 'Health ↔ Finance Cross-Verification', description: 'Sync health insurance claims with finance records',
      createdBy: admin._id, sourceDepartment: depts[0]._id, targetDepartment: depts[1]._id, dataSource: sources[0]._id,
      status: 'active', complianceLevel: 'strict',
      transformations: [{ type: 'anonymize', config: { fields: ['name'] }, order: 1, description: 'Remove PII' }, { type: 'filter', config: { field: 'district', operator: 'exists' }, order: 2, description: 'Filter valid records' }],
      privacy: { anonymizeFields: ['name', 'patient_id'], retentionDays: 180 },
      schedule: { type: 'interval', interval: 60 },
      stats: { totalRuns: 45, successfulRuns: 43, failedRuns: 2, totalRecordsProcessed: 125000, lastRunStatus: 'success', avgProcessingTime: 2300 }
    },
    {
      name: 'Education → Social Welfare Mapping', description: 'Identify scholarship eligible students',
      createdBy: analyst._id, sourceDepartment: depts[2]._id, targetDepartment: depts[5]._id, dataSource: sources[2]._id,
      status: 'active', complianceLevel: 'standard',
      transformations: [{ type: 'filter', config: { field: 'district' }, order: 1 }, { type: 'aggregate', config: { groupBy: 'district' }, order: 2 }],
      privacy: { anonymizeFields: [], retentionDays: 365 },
      schedule: { type: 'interval', interval: 1440 },
      stats: { totalRuns: 12, successfulRuns: 12, failedRuns: 0, totalRecordsProcessed: 88000, lastRunStatus: 'success', avgProcessingTime: 1800 }
    },
    {
      name: 'Agriculture → Finance Subsidy Audit', description: 'Verify subsidy disbursements against farmer records',
      createdBy: admin._id, sourceDepartment: depts[4]._id, targetDepartment: depts[1]._id, dataSource: sources[4]._id,
      status: 'paused', complianceLevel: 'strict',
      transformations: [{ type: 'validate', config: {}, order: 1 }, { type: 'deduplicate', config: { field: 'farmer_id' }, order: 2 }],
      privacy: { anonymizeFields: ['farmer_id'], retentionDays: 730 },
      schedule: { type: 'manual' },
      stats: { totalRuns: 8, successfulRuns: 7, failedRuns: 1, totalRecordsProcessed: 52000, lastRunStatus: 'success', avgProcessingTime: 3100 }
    },
    {
      name: 'Transport → Finance Tax Sync', description: 'Sync road tax and vehicle registration',
      createdBy: admin._id, sourceDepartment: depts[3]._id, targetDepartment: depts[1]._id, dataSource: sources[3]._id,
      status: 'active', complianceLevel: 'standard',
      transformations: [{ type: 'anonymize', config: { fields: ['owner_name'] }, order: 1 }],
      privacy: { anonymizeFields: ['owner_name'], retentionDays: 365 },
      schedule: { type: 'interval', interval: 120 },
      stats: { totalRuns: 30, successfulRuns: 28, failedRuns: 2, totalRecordsProcessed: 180000, lastRunStatus: 'success', avgProcessingTime: 1500 }
    }
  ]);

  // Genesis block + pipeline blocks
  const genesisHash = crypto.createHash('sha256').update('GENESIS_BLOCK_INTELLIDATAOPS_2024').digest('hex');
  await BlockchainBlock.create({
    blockNumber: 1, previousHash: '0'.repeat(64), hash: genesisHash,
    data: { type: 'audit_log', metadata: { event: 'Platform initialized', version: '1.0.0' } },
    validator: admin._id
  });

  let prevHash = genesisHash;
  for (let i = 0; i < 8; i++) {
    const pl = pipelines[i % pipelines.length];
    const dataStr = JSON.stringify({ pipeline: pl.name, run: i, ts: new Date() });
    const hash = crypto.createHash('sha256').update(prevHash + dataStr + i).digest('hex');
    await BlockchainBlock.create({
      blockNumber: i + 2, previousHash: prevHash, hash,
      data: {
        type: 'pipeline_run', pipelineId: pl._id,
        sourceDept: depts[0].name, targetDept: depts[1].name,
        recordCount: Math.floor(Math.random() * 5000) + 500,
        dataHash: crypto.createHash('sha256').update(dataStr).digest('hex'),
        transformations: pl.transformations.map(t => t.type)
      },
      validator: i % 2 === 0 ? admin._id : analyst._id
    });
    prevHash = hash;
  }

  console.log('✅ Seed complete!');
  console.log('👤 Admin: admin@intellidataops.gov / admin123');
  console.log('👤 Analyst: analyst@intellidataops.gov / analyst123');
  mongoose.disconnect();
};

seed().catch(err => { console.error(err); mongoose.disconnect(); });