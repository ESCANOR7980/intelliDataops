const express = require('express');
const router = express.Router();
const Pipeline = require('../models/Pipeline');
const BlockchainBlock = require('../models/BlockchainBlock');
const auth = require('../middleware/auth');
const crypto = require('crypto');

router.get('/', auth, async (req, res) => {
  try {
    const { status, sourceDepartment, targetDepartment } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (sourceDepartment) filter.sourceDepartment = sourceDepartment;
    if (targetDepartment) filter.targetDepartment = targetDepartment;
    const pipelines = await Pipeline.find(filter)
      .populate('sourceDepartment', 'name code color icon')
      .populate('targetDepartment', 'name code color icon')
      .populate('dataSource', 'name type status')
      .populate('createdBy', 'name email')
      .sort('-createdAt');
    res.json({ success: true, pipelines, count: pipelines.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id)
      .populate('sourceDepartment', 'name code color')
      .populate('targetDepartment', 'name code color')
      .populate('dataSource')
      .populate('createdBy', 'name email');
    if (!pipeline) return res.status(404).json({ success: false, message: 'Pipeline not found' });
    res.json({ success: true, pipeline });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const pipeline = new Pipeline({ ...req.body, createdBy: req.user._id });
    await pipeline.save();
    res.status(201).json({ success: true, pipeline });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const pipeline = await Pipeline.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, pipeline });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Pipeline.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Pipeline deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Execute pipeline
router.post('/:id/execute', auth, async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id).populate('sourceDepartment targetDepartment');
    if (!pipeline) return res.status(404).json({ success: false, message: 'Pipeline not found' });

    // Simulate execution
    await new Promise(r => setTimeout(r, 1200));
    const success = Math.random() > 0.15;
    const recordsProcessed = Math.floor(Math.random() * 5000) + 100;
    const processingTime = Math.floor(Math.random() * 3000) + 500;

    pipeline.stats.totalRuns += 1;
    pipeline.stats.lastRunAt = new Date();
    pipeline.stats.lastRunStatus = success ? 'success' : 'failed';
    if (success) {
      pipeline.stats.successfulRuns += 1;
      pipeline.stats.totalRecordsProcessed += recordsProcessed;
      pipeline.status = 'active';
    } else {
      pipeline.stats.failedRuns += 1;
    }
    pipeline.stats.avgProcessingTime = processingTime;

    // Record on blockchain
    if (success) {
      const lastBlock = await BlockchainBlock.findOne().sort('-blockNumber');
      const blockNumber = lastBlock ? lastBlock.blockNumber + 1 : 1;
      const prevHash = lastBlock ? lastBlock.hash : '0'.repeat(64);
      const dataString = JSON.stringify({
        pipelineId: pipeline._id,
        sourceDept: pipeline.sourceDepartment?.name,
        targetDept: pipeline.targetDepartment?.name,
        recordCount: recordsProcessed,
        timestamp: new Date()
      });
      const hash = crypto.createHash('sha256').update(prevHash + dataString + Date.now()).digest('hex');
      const block = new BlockchainBlock({
        blockNumber, previousHash: prevHash, hash,
        data: {
          type: 'pipeline_run',
          pipelineId: pipeline._id,
          sourceDept: pipeline.sourceDepartment?.name,
          targetDept: pipeline.targetDepartment?.name,
          recordCount: recordsProcessed,
          dataHash: crypto.createHash('sha256').update(dataString).digest('hex'),
          transformations: pipeline.transformations.map(t => t.type)
        },
        validator: req.user._id
      });
      await block.save();
      pipeline.blockchainHash = hash;
    }

    await pipeline.save();
    res.json({ success, pipeline, recordsProcessed, processingTime, message: success ? 'Pipeline executed successfully' : 'Execution failed' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;