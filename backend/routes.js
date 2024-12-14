const express = require('express');
const { Influencer, Employee } = require('./models');
const router = express.Router();

// Get all employees (for manager selection)
router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find()
      .select('_id name')
      .lean()
      .limit(100);
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
});

// Get influencers with filters
router.get('/', async (req, res) => {
  try {
    const { nameFilter, managerFilter } = req.query;
    let query = {};
    
    // Build query based on filters
    if (nameFilter) {
      const nameRegex = new RegExp(nameFilter, 'i');
      query.$or = [
        { firstName: nameRegex },
        { lastName: nameRegex }
      ];
    }

    if (managerFilter) {
      if (managerFilter.toLowerCase() === 'none') {
        query.manager = null;
      } else {
        const managerRegex = new RegExp(managerFilter, 'i');
        const managers = await Employee.find({ name: managerRegex })
          .select('_id')
          .lean();
        const managerIds = managers.map(m => m._id);
        query.manager = managerIds.length > 0 ? { $in: managerIds } : null;
      }
    }

    // Execute query with timeout and optimization
    const influencers = await Influencer.find(query)
      .select('firstName lastName socialMediaAccounts manager')
      .populate('manager', 'name')
      .lean()
      .limit(100)
      .maxTimeMS(5000);

    res.json(influencers);
  } catch (error) {
    console.error('Error fetching influencers:', error);
    res.status(500).json({ message: 'Error fetching influencers', error: error.message });
  }
});

// Create or update influencer
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, socialMediaAccounts } = req.body;

    let influencer = await Influencer.findOne({
      firstName: new RegExp(`^${firstName}$`, 'i'),
      lastName: new RegExp(`^${lastName}$`, 'i')
    }).maxTimeMS(3000);

    if (influencer) {
      // Update existing influencer
      const uniqueAccounts = [...new Set([
        ...influencer.socialMediaAccounts,
        ...socialMediaAccounts
      ].map(acc => JSON.stringify(acc)))]
      .map(str => JSON.parse(str));

      influencer.socialMediaAccounts = uniqueAccounts;
    } else {
      // Create new influencer
      influencer = new Influencer(req.body);
    }

    await influencer.save();
    
    const savedInfluencer = await Influencer.findById(influencer._id)
      .populate('manager', 'name')
      .lean()
      .maxTimeMS(3000);

    res.status(201).json(savedInfluencer);
  } catch (error) {
    console.error('Error creating/updating influencer:', error);
    res.status(400).json({ message: 'Error creating/updating influencer', error: error.message });
  }
});

// Update influencer's manager
router.patch('/:id/manager', async (req, res) => {
  try {
    const { managerId } = req.body;
    
    const influencer = await Influencer.findByIdAndUpdate(
      req.params.id,
      { manager: managerId || null },
      { new: true }
    )
    .populate('manager', 'name')
    .lean()
    .maxTimeMS(3000);

    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    res.json(influencer);
  } catch (error) {
    console.error('Error updating manager:', error);
    res.status(500).json({ message: 'Error updating manager', error: error.message });
  }
});

module.exports = router;