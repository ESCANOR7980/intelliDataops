const express = require('express');
const router = express.Router();
const DataSource = require('../models/DataSource');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { department, type, status } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (type) filter.type = type;
    if (status) filter.status = status;
    const sources = await DataSource.find(filter).populate('department', 'name code color').sort('-createdAt');
    res.json({ success: true, dataSources: sources, count: sources.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const source = await DataSource.findById(req.params.id).populate('department', 'name code color icon');
    if (!source) return res.status(404).json({ success: false, message: 'DataSource not found' });
    res.json({ success: true, dataSource: source });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const source = new DataSource(req.body);
    await source.save();
    res.status(201).json({ success: true, dataSource: source });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const source = await DataSource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, dataSource: source });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await DataSource.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'DataSource deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Test connection — simulates connectivity check
router.post('/:id/test', auth, async (req, res) => {
  try {
    const source = await DataSource.findById(req.params.id);
    if (!source) return res.status(404).json({ success: false, message: 'Not found' });
    // Simulate test
    await new Promise(r => setTimeout(r, 800));
    const success = Math.random() > 0.2;
    if (success) {
      source.status = 'active';
      source.lastFetched = new Date();
      source.qualityScore = Math.floor(Math.random() * 30) + 70;
    } else {
      source.status = 'error';
      source.errorLog.push({ message: 'Connection timeout - simulated' });
    }
    await source.save();
    res.json({ success, message: success ? 'Connection successful' : 'Connection failed', source });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;