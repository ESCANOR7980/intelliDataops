const express = require('express');
const router = express.Router();
const BlockchainBlock = require('../models/BlockchainBlock');
const auth = require('../middleware/auth');
const crypto = require('crypto');

router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    const blocks = await BlockchainBlock.find()
      .populate('validator', 'name email')
      .sort('-blockNumber')
      .limit(parseInt(limit))
      .skip(skip);
    const total = await BlockchainBlock.countDocuments();
    res.json({ success: true, blocks, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const total = await BlockchainBlock.countDocuments();
    const latest = await BlockchainBlock.findOne().sort('-blockNumber');
    const byType = await BlockchainBlock.aggregate([
      { $group: { _id: '$data.type', count: { $sum: 1 } } }
    ]);
    const totalRecords = await BlockchainBlock.aggregate([
      { $group: { _id: null, total: { $sum: '$data.recordCount' } } }
    ]);
    res.json({
      success: true,
      stats: {
        totalBlocks: total,
        latestBlock: latest?.blockNumber || 0,
        latestHash: latest?.hash?.substring(0, 16) + '...' || 'N/A',
        byType,
        totalRecordsSecured: totalRecords[0]?.total || 0,
        chainIntegrity: true
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/verify', auth, async (req, res) => {
  try {
    const blocks = await BlockchainBlock.find().sort('blockNumber');
    let isValid = true;
    const issues = [];
    for (let i = 1; i < blocks.length; i++) {
      if (blocks[i].previousHash !== blocks[i - 1].hash) {
        isValid = false;
        issues.push(`Block ${blocks[i].blockNumber}: chain broken`);
      }
    }
    res.json({ success: true, isValid, totalBlocks: blocks.length, issues });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const block = await BlockchainBlock.findById(req.params.id).populate('validator', 'name email').populate('data.pipelineId', 'name');
    if (!block) return res.status(404).json({ success: false, message: 'Block not found' });
    res.json({ success: true, block });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Add audit log block
router.post('/log', auth, async (req, res) => {
  try {
    const { type, metadata } = req.body;
    const lastBlock = await BlockchainBlock.findOne().sort('-blockNumber');
    const blockNumber = lastBlock ? lastBlock.blockNumber + 1 : 1;
    const prevHash = lastBlock ? lastBlock.hash : '0'.repeat(64);
    const dataString = JSON.stringify({ type, metadata, timestamp: new Date(), userId: req.user._id });
    const hash = crypto.createHash('sha256').update(prevHash + dataString + Date.now()).digest('hex');
    const block = new BlockchainBlock({
      blockNumber, previousHash: prevHash, hash,
      data: { type, metadata },
      validator: req.user._id
    });
    await block.save();
    res.status(201).json({ success: true, block });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;