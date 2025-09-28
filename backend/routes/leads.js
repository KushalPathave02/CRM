const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get all leads with filtering and pagination
// @route   GET /api/leads
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['New', 'Contacted', 'Converted', 'Lost']).withMessage('Invalid status'),
  query('customer').optional().isMongoId().withMessage('Invalid customer ID'),
  query('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, customer, priority } = req.query;

    // Build query
    let query = {};
    
    if (status) query.status = status;
    if (customer) query.customer = customer;
    if (priority) query.priority = priority;

    // Get leads with pagination
    const leads = await Lead.find(query)
      .populate('customer', 'name email company')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Lead.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: leads,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leads'
    });
  }
});

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('customer', 'name email company phone')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('notes.createdBy', 'name email');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lead'
    });
  }
});

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Converted', 'Lost'])
    .withMessage('Invalid status'),
  body('value')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority'),
  body('customer')
    .isMongoId()
    .withMessage('Valid customer ID is required'),
  body('expectedCloseDate')
    .optional()
    .isISO8601()
    .withMessage('Expected close date must be a valid date'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify customer exists
    const customer = await Customer.findById(req.body.customer);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const lead = await Lead.create({
      ...req.body,
      createdBy: req.user.id
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate('customer', 'name email company')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: populatedLead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating lead'
    });
  }
});

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Converted', 'Lost'])
    .withMessage('Invalid status'),
  body('value')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority'),
  body('expectedCloseDate')
    .optional()
    .isISO8601()
    .withMessage('Expected close date must be a valid date'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('customer', 'name email company')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating lead'
    });
  }
});

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if user owns the lead or is admin
    if (lead.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lead'
      });
    }

    await Lead.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting lead'
    });
  }
});

// @desc    Add note to lead
// @route   POST /api/leads/:id/notes
// @access  Private
router.post('/:id/notes', [
  body('content')
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('Note content must be between 1 and 300 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const newNote = {
      content: req.body.content,
      createdBy: req.user.id,
      createdAt: new Date()
    };

    lead.notes.push(newNote);
    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('notes.createdBy', 'name email');

    res.json({
      success: true,
      message: 'Note added successfully',
      data: updatedLead.notes[updatedLead.notes.length - 1]
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding note'
    });
  }
});

// @desc    Get leads by customer
// @route   GET /api/leads/customer/:customerId
// @access  Private
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status } = req.query;

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    let query = { customer: customerId };
    if (status) query.status = status;

    const leads = await Lead.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leads
    });
  } catch (error) {
    console.error('Get customer leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customer leads'
    });
  }
});

module.exports = router;
