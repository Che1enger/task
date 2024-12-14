const express = require('express');
const { Influencer, Employee } = require('./models');
const router = express.Router();

// Get all employees
router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find().lean();
    res.json(employees);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// Get influencers with filters
router.get('/', async (req, res) => {
  try {
    const { nameFilter, managerFilter } = req.query;
    let query = {};
    
    if (nameFilter) {
      query.$or = [
        { firstName: { $regex: nameFilter, $options: 'i' } },
        { lastName: { $regex: nameFilter, $options: 'i' } }
      ];
    }

    if (managerFilter) {
      if (managerFilter.toLowerCase() === 'none') {
        query.manager = null;
      } else {
        const managers = await Employee.find({
          name: { $regex: managerFilter, $options: 'i' }
        }).lean();
        const managerIds = managers.map(m => m._id);
        query.manager = managerIds.length > 0 ? { $in: managerIds } : null;
      }
    }

    const influencers = await Influencer.find(query)
      .populate('manager', 'name')
      .lean();

    res.json(influencers);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error fetching influencers' });
  }
});

// Create influencer
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, socialMediaAccounts } = req.body;
    
    const influencer = new Influencer(req.body);
    await influencer.save();
    
    const savedInfluencer = await Influencer.findById(influencer._id)
      .populate('manager', 'name')
      .lean();

    res.status(201).json(savedInfluencer);
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ message: 'Error creating influencer' });
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
    .lean();

    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    res.json(influencer);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error updating manager' });
  }
});

module.exports = router;