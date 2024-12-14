const express = require('express');
const { Influencer, Employee } = require('./models');
const router = express.Router();

// Get all employees with caching
let employeesCache = null;
let lastEmployeeFetch = null;
const CACHE_DURATION = 60000; // 1 minute cache

router.get('/employees', async (req, res) => {
  try {
    // Use cached employees if available and not expired
    if (employeesCache && lastEmployeeFetch && (Date.now() - lastEmployeeFetch) < CACHE_DURATION) {
      return res.json(employeesCache);
    }

    const employees = await Employee.find()
      .select('_id name')
      .lean()
      .exec();

    // Update cache
    employeesCache = employees;
    lastEmployeeFetch = Date.now();

    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// Get influencers with pagination and efficient querying
router.get('/', async (req, res) => {
  try {
    const { nameFilter, managerFilter, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (nameFilter) {
      query.$or = [
        { firstName: new RegExp(nameFilter, 'i') },
        { lastName: new RegExp(nameFilter, 'i') }
      ];
    }

    if (managerFilter) {
      if (managerFilter.toLowerCase() === 'none') {
        query.manager = null;
      } else {
        const managers = await Employee.find({
          name: new RegExp(managerFilter, 'i')
        })
        .select('_id')
        .lean()
        .exec();
        
        query.manager = managers.length > 0 ? { $in: managers.map(m => m._id) } : null;
      }
    }

    const [influencers, total] = await Promise.all([
      Influencer.find(query)
        .select('firstName lastName socialMediaAccounts manager')
        .populate('manager', 'name')
        .sort({ firstName: 1, lastName: 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean()
        .exec(),
      Influencer.countDocuments(query)
    ]);

    res.json({
      influencers,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching influencers:', error);
    res.status(500).json({ message: 'Error fetching influencers' });
  }
});

// Create influencer with validation
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, socialMediaAccounts } = req.body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }

    // Remove duplicate social media accounts
    const uniqueAccounts = Array.from(
      new Set(socialMediaAccounts?.map(acc => JSON.stringify(acc)))
    ).map(str => JSON.parse(str));

    const influencer = new Influencer({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      socialMediaAccounts: uniqueAccounts
    });

    await influencer.save();

    const savedInfluencer = await Influencer.findById(influencer._id)
      .populate('manager', 'name')
      .lean()
      .exec();

    res.status(201).json(savedInfluencer);
  } catch (error) {
    console.error('Error creating influencer:', error);
    res.status(400).json({ message: 'Error creating influencer' });
  }
});

// Update influencer's manager efficiently
router.patch('/:id/manager', async (req, res) => {
  try {
    const { managerId } = req.body;
    
    const influencer = await Influencer.findByIdAndUpdate(
      req.params.id,
      { $set: { manager: managerId || null } },
      { new: true }
    )
    .populate('manager', 'name')
    .lean()
    .exec();

    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    res.json(influencer);
  } catch (error) {
    console.error('Error updating manager:', error);
    res.status(500).json({ message: 'Error updating manager' });
  }
});

module.exports = router;