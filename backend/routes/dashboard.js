const express = require('express');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    // Get basic counts
    const totalCustomers = await Customer.countDocuments();
    const totalLeads = await Lead.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: 'active' });
    
    // Get leads by status
    const leadsByStatus = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      }
    ]);

    // Get leads by priority
    const leadsByPriority = await Lead.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total lead value
    const totalLeadValue = await Lead.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$value' }
        }
      }
    ]);

    // Get converted leads value
    const convertedLeadsValue = await Lead.aggregate([
      {
        $match: { status: 'Converted' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$value' }
        }
      }
    ]);

    // Get recent leads (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentLeads = await Lead.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get recent customers (last 30 days)
    const recentCustomers = await Customer.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get monthly lead creation trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyLeadTrend = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get top customers by lead value
    const topCustomers = await Lead.aggregate([
      {
        $group: {
          _id: '$customer',
          totalValue: { $sum: '$value' },
          leadCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      },
      {
        $project: {
          customerName: '$customer.name',
          customerCompany: '$customer.company',
          totalValue: 1,
          leadCount: 1
        }
      },
      {
        $sort: { totalValue: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          totalLeads,
          activeCustomers,
          recentLeads,
          recentCustomers,
          totalLeadValue: totalLeadValue[0]?.total || 0,
          convertedLeadsValue: convertedLeadsValue[0]?.total || 0
        },
        leadsByStatus: leadsByStatus.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            totalValue: item.totalValue
          };
          return acc;
        }, {}),
        leadsByPriority: leadsByPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        monthlyLeadTrend,
        topCustomers
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
});

// @desc    Get leads chart data
// @route   GET /api/dashboard/leads-chart
// @access  Private
router.get('/leads-chart', async (req, res) => {
  try {
    const { type = 'status' } = req.query;

    let chartData;

    if (type === 'status') {
      chartData = await Lead.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            value: { $sum: '$value' }
          }
        },
        {
          $project: {
            label: '$_id',
            count: 1,
            value: 1,
            _id: 0
          }
        }
      ]);
    } else if (type === 'priority') {
      chartData = await Lead.aggregate([
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            label: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);
    } else if (type === 'monthly') {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      chartData = await Lead.aggregate([
        {
          $match: {
            createdAt: { $gte: twelveMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            value: { $sum: '$value' }
          }
        },
        {
          $project: {
            label: {
              $concat: [
                { $toString: '$_id.month' },
                '/',
                { $toString: '$_id.year' }
              ]
            },
            count: 1,
            value: 1,
            _id: 0
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);
    }

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Leads chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chart data'
    });
  }
});

// @desc    Get conversion funnel data
// @route   GET /api/dashboard/conversion-funnel
// @access  Private
router.get('/conversion-funnel', async (req, res) => {
  try {
    const funnelData = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          totalValue: 1,
          _id: 0
        }
      }
    ]);

    // Define the funnel order
    const funnelOrder = ['New', 'Contacted', 'Converted', 'Lost'];
    const orderedFunnel = funnelOrder.map(status => {
      const data = funnelData.find(item => item.status === status);
      return {
        status,
        count: data?.count || 0,
        totalValue: data?.totalValue || 0
      };
    });

    // Calculate conversion rates
    const totalLeads = orderedFunnel.reduce((sum, item) => sum + item.count, 0);
    const funnelWithRates = orderedFunnel.map(item => ({
      ...item,
      percentage: totalLeads > 0 ? ((item.count / totalLeads) * 100).toFixed(1) : 0
    }));

    res.json({
      success: true,
      data: {
        funnel: funnelWithRates,
        totalLeads,
        conversionRate: totalLeads > 0 ? 
          ((orderedFunnel.find(item => item.status === 'Converted')?.count || 0) / totalLeads * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Conversion funnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversion funnel data'
    });
  }
});

// @desc    Get recent activities
// @route   GET /api/dashboard/recent-activities
// @access  Private
router.get('/recent-activities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent leads
    const recentLeads = await Lead.find()
      .populate('customer', 'name company')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title status value createdAt customer createdBy');

    // Get recent customers
    const recentCustomers = await Customer.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name company status createdAt createdBy');

    // Combine and sort by creation date
    const activities = [
      ...recentLeads.map(lead => ({
        type: 'lead',
        id: lead._id,
        title: `New lead: ${lead.title}`,
        description: `${lead.customer.name} - ${lead.customer.company}`,
        status: lead.status,
        value: lead.value,
        createdAt: lead.createdAt,
        createdBy: lead.createdBy
      })),
      ...recentCustomers.map(customer => ({
        type: 'customer',
        id: customer._id,
        title: `New customer: ${customer.name}`,
        description: customer.company,
        status: customer.status,
        createdAt: customer.createdAt,
        createdBy: customer.createdBy
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent activities'
    });
  }
});

module.exports = router;
