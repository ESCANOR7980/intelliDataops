const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// In-memory policy store (for hackathon; replace with model in prod)
let policies = [
  {
    id: '1', name: 'Data Minimization Policy', category: 'privacy',
    description: 'Only collect and share the minimum data necessary for the purpose.',
    status: 'active', compliance: 'GDPR', severity: 'high', createdAt: new Date()
  },
  {
    id: '2', name: 'Cross-Department Data Sharing', category: 'access',
    description: 'Departments must have signed data sharing agreements before pipeline creation.',
    status: 'active', compliance: 'Government Act 2023', severity: 'high', createdAt: new Date()
  },
  {
    id: '3', name: 'PII Anonymization Requirement', category: 'privacy',
    description: 'All personally identifiable information must be anonymized before cross-department sharing.',
    status: 'active', compliance: 'PDPB', severity: 'critical', createdAt: new Date()
  },
  {
    id: '4', name: 'Audit Trail Mandate', category: 'compliance',
    description: 'All data transfers must be recorded on the immutable blockchain audit trail.',
    status: 'active', compliance: 'RTI Act', severity: 'high', createdAt: new Date()
  },
  {
    id: '5', name: 'Data Retention Limit', category: 'governance',
    description: 'Transferred data must not be retained beyond 365 days unless explicitly approved.',
    status: 'draft', compliance: 'Internal', severity: 'medium', createdAt: new Date()
  }
];

router.get('/', auth, (req, res) => {
  res.json({ success: true, policies, count: policies.length });
});

router.post('/', auth, (req, res) => {
  const policy = { id: Date.now().toString(), ...req.body, createdAt: new Date() };
  policies.push(policy);
  res.status(201).json({ success: true, policy });
});

router.put('/:id', auth, (req, res) => {
  const idx = policies.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Policy not found' });
  policies[idx] = { ...policies[idx], ...req.body };
  res.json({ success: true, policy: policies[idx] });
});

router.delete('/:id', auth, (req, res) => {
  policies = policies.filter(p => p.id !== req.params.id);
  res.json({ success: true, message: 'Policy deleted' });
});

module.exports = router;