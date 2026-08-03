const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const auth = require('../middleware/auth');

// GET all
router.get('/', auth, async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const departments = await Department.find(filter).sort('name');
    res.json({ success: true, departments, count: departments.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET one
router.get('/:id', auth, async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, department: dept });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST create
router.post('/', auth, async (req, res) => {
  try {
    const dept = new Department(req.body);
    await dept.save();
    res.status(201).json({ success: true, department: dept });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT update
router.put('/:id', auth, async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, department: dept });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Department deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET stats
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const DataSource = require('../models/DataSource');
    const Pipeline = require('../models/Pipeline');
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Not found' });
    const dataSources = await DataSource.countDocuments({ department: req.params.id });
    const pipelines = await Pipeline.countDocuments({ $or: [{ sourceDepartment: req.params.id }, { targetDepartment: req.params.id }] });
    res.json({ success: true, stats: { department: dept, dataSources, pipelines } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;