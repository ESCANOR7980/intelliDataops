const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Supported integration formats
const FORMATS = {
  REST: { name: 'REST API', description: 'RESTful API integration', icon: '🔌' },
  GraphQL: { name: 'GraphQL', description: 'GraphQL query interface', icon: '⚡' },
  CSV: { name: 'CSV Export', description: 'Comma-separated values', icon: '📊' },
  JSON: { name: 'JSON Feed', description: 'JSON data feed', icon: '{ }' },
  XML: { name: 'XML/SOAP', description: 'XML and SOAP services', icon: '📄' },
  Webhook: { name: 'Webhook', description: 'Event-driven webhooks', icon: '🔔' }
};

router.get('/formats', auth, (req, res) => {
  res.json({ success: true, formats: FORMATS });
});

// Generate API documentation for a data source
router.get('/docs/:dataSourceId', auth, async (req, res) => {
  try {
    const DataSource = require('../models/DataSource');
    const source = await DataSource.findById(req.params.dataSourceId).populate('department', 'name code');
    if (!source) return res.status(404).json({ success: false, message: 'Not found' });

    const docs = {
      openapi: '3.0.0',
      info: { title: `${source.name} API`, version: '1.0.0', description: source.description },
      servers: [{ url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/integrations/${source._id}` }],
      paths: {
        '/data': {
          get: {
            summary: `Get data from ${source.name}`,
            parameters: [
              { name: 'limit', in: 'query', schema: { type: 'integer', default: 100 } },
              { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
              { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'xml'] } }
            ],
            responses: { '200': { description: 'Success' }, '401': { description: 'Unauthorized' } }
          }
        }
      }
    };
    res.json({ success: true, docs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Simulate data fetch from integration
router.get('/:dataSourceId/data', auth, async (req, res) => {
  try {
    const DataSource = require('../models/DataSource');
    const source = await DataSource.findById(req.params.dataSourceId);
    if (!source) return res.status(404).json({ success: false, message: 'Not found' });

    const { format = 'json', limit = 10 } = req.query;
    // Return sample/simulated data
    const sampleData = source.sampleData || generateSampleData(source.schema, parseInt(limit));

    if (format === 'csv') {
      const headers = source.schema.map(f => f.fieldName).join(',');
      res.setHeader('Content-Type', 'text/csv');
      return res.send(headers + '\n' + 'sample,data,here');
    }
    res.json({ success: true, source: source.name, recordCount: sampleData.length || 0, data: sampleData, fetchedAt: new Date() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

function generateSampleData(schema, limit) {
  if (!schema || schema.length === 0) return [];
  return Array.from({ length: Math.min(limit, 5) }, (_, i) => {
    const obj = {};
    schema.forEach(f => { obj[f.fieldName] = f.pii ? '***REDACTED***' : `sample_${f.dataType}_${i}`; });
    return obj;
  });
}

module.exports = router;