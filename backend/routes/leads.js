const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Lead = require('../models/Lead');

// Validation rules
const leadValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 100 }),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\d{10}$/).withMessage('Phone must be exactly 10 digits'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address'),
  body('location').trim().notEmpty().withMessage('Location/City is required'),
  body('propertyType')
    .notEmpty().withMessage('Property type is required')
    .isIn(['Residential', 'Commercial', 'Industrial']).withMessage('Invalid property type'),
  body('systemSize')
    .notEmpty().withMessage('System size is required')
    .isFloat({ min: 1, max: 100 }).withMessage('System size must be between 1 and 100 kW'),
  body('source')
    .notEmpty().withMessage('Source is required')
    .isIn(['Website', 'Referral', 'Walk-in', 'Social Media']).withMessage('Invalid source'),
];

// ─── GET /api/leads ─── List all leads with filters
router.get('/', async (req, res) => {
  try {
    const { status, location, startDate, endDate, search, page = 1, limit = 50 } = req.query;

    const filter = {};

    if (status && status !== 'All') filter.status = status;

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, total, page: parseInt(page), leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/leads/dashboard ─── Analytics data
router.get('/dashboard', async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();

    const statusCounts = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const wonLeads = statusCounts.find(s => s._id === 'Won')?.count || 0;
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;

    const recentLeads = await Lead.find().sort({ createdAt: -1 }).limit(5);

    const allStatuses = ['New Lead', 'Contacted', 'Site Visit Scheduled', 'Proposal Sent', 'Won', 'Lost'];
    const statusBreakdown = allStatuses.map(status => ({
      status,
      count: statusCounts.find(s => s._id === status)?.count || 0,
    }));

    res.json({
      success: true,
      data: {
        totalLeads,
        wonLeads,
        conversionRate: parseFloat(conversionRate),
        statusBreakdown,
        recentLeads,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/leads/locations ─── Unique locations for filter dropdown
router.get('/locations', async (req, res) => {
  try {
    const locations = await Lead.distinct('location');
    res.json({ success: true, locations: locations.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/leads/:id ─── Single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/leads ─── Create new lead
router.post('/', leadValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json({ success: true, lead });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A lead with this email already exists.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/leads/:id ─── Update lead
router.put('/:id', leadValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A lead with this email already exists.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/leads/:id/status ─── Update status only
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['New Lead', 'Contacted', 'Site Visit Scheduled', 'Proposal Sent', 'Won', 'Lost'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/leads/:id ─── Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
