const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const DataSource = require('../models/DataSource');
const Pipeline = require('../models/Pipeline');
const BlockchainBlock = require('../models/BlockchainBlock');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Dashboard overview
router.get('/overview', auth, async (req, res) => {
  try {
    const [depts, sources, pipelines, blocks, users] = await Promise.all([
      Department.countDocuments({ isActive: true }),
      DataSource.countDocuments(),
      Pipeline.countDocuments(),
      BlockchainBlock.countDocuments(),
      User.countDocuments({ isActive: true })
    ]);

    const activePipelines = await Pipeline.countDocuments({ status: 'active' });
    const pipelineStats = await Pipeline.aggregate([
      { $group: { _id: null, totalRecords: { $sum: '$stats.totalRecordsProcessed' }, totalRuns: { $sum: '$stats.totalRuns' } } }
    ]);
    const sourcesByType = await DataSource.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]);
    const pipelinesByStatus = await Pipeline.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const recentBlocks = await BlockchainBlock.find().sort('-blockNumber').limit(5).populate('validator', 'name');

    res.json({
      success: true,
      overview: {
        departments: depts,
        dataSources: sources,
        pipelines,
        activePipelines,
        blockchainBlocks: blocks,
        users,
        totalRecordsProcessed: pipelineStats[0]?.totalRecords || 0,
        totalPipelineRuns: pipelineStats[0]?.totalRuns || 0,
      },
      charts: { sourcesByType, pipelinesByStatus },
      recentBlocks
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Interoperability score
router.get('/interop-score', auth, async (req, res) => {
  try {
    const depts = await Department.find({ isActive: true }).select('name code interopScore category');
    const avgScore = depts.reduce((sum, d) => sum + d.interopScore, 0) / (depts.length || 1);
    res.json({ success: true, departments: depts, averageScore: Math.round(avgScore) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Data flow map
router.get('/data-flow', auth, async (req, res) => {
  try {
    const pipelines = await Pipeline.find({ status: { $in: ['active', 'paused'] } })
      .populate('sourceDepartment', 'name code color')
      .populate('targetDepartment', 'name code color')
      .select('name status stats sourceDepartment targetDepartment');
    const nodes = new Map();
    const links = [];
    pipelines.forEach(p => {
      if (p.sourceDepartment) nodes.set(p.sourceDepartment._id.toString(), p.sourceDepartment);
      if (p.targetDepartment) nodes.set(p.targetDepartment._id.toString(), p.targetDepartment);
      if (p.sourceDepartment && p.targetDepartment) {
        links.push({ source: p.sourceDepartment._id, target: p.targetDepartment._id, pipeline: p.name, status: p.status, records: p.stats.totalRecordsProcessed });
      }
    });
    res.json({ success: true, nodes: Array.from(nodes.values()), links });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Activity timeline (last 7 days)
router.get('/activity', auth, async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const blocks = await BlockchainBlock.find({ timestamp: { $gte: sevenDaysAgo } })
      .sort('timestamp')
      .select('timestamp data.type data.recordCount');
    const daily = {};
    blocks.forEach(b => {
      const day = b.timestamp.toISOString().split('T')[0];
      if (!daily[day]) daily[day] = { date: day, transactions: 0, records: 0 };
      daily[day].transactions++;
      daily[day].records += b.data?.recordCount || 0;
    });
    res.json({ success: true, activity: Object.values(daily) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;