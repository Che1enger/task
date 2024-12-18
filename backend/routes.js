const express = require('express');
const { Influencer, Employee } = require('./models');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, socialMediaAccounts } = req.body;
    
    let influencer = await Influencer.findOne({ 
      firstName: { $regex: new RegExp(`^${firstName}$`, 'i') },
      lastName: { $regex: new RegExp(`^${lastName}$`, 'i') }
    });

    if (influencer) {
      const uniqueAccounts = [...new Set([
        ...influencer.socialMediaAccounts,
        ...socialMediaAccounts
      ].map(acc => JSON.stringify(acc)))]
      .map(str => JSON.parse(str));

      influencer.socialMediaAccounts = uniqueAccounts;
      await influencer.save();
    } else {
      influencer = new Influencer(req.body);
      await influencer.save();
    }

    const updatedInfluencer = await Influencer.findById(influencer._id).populate('manager');
    res.status(201).send(updatedInfluencer);
  } catch (error) {
    console.error('Error creating influencer:', error);
    res.status(400).send(error);
  }
});

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

    let matchingManagerIds = [];
    if (managerFilter) {
      const managers = await Employee.find({
        name: { $regex: managerFilter, $options: 'i' }
      });
      matchingManagerIds = managers.map(m => m._id);
      
      if (matchingManagerIds.length > 0) {
        query.manager = { $in: matchingManagerIds };
      } else if (managerFilter.toLowerCase() === 'none') {
        query.manager = null;
      }
    }

    const influencers = await Influencer.find(query)
      .populate('manager')
      .sort({ firstName: 1, lastName: 1 });
      
    res.send(influencers);
  } catch (error) {
    console.error('Error fetching influencers:', error);
    res.status(500).send(error);
  }
});

router.patch('/:id/manager', async (req, res) => {
  try {
    console.log('Received PATCH request:', { 
      id: req.params.id, 
      body: req.body,
      headers: req.headers 
    });
    
    const { managerId } = req.body;
    const influencer = await Influencer.findById(req.params.id);
    
    if (!influencer) {
      console.log('Influencer not found:', req.params.id);
      return res.status(404).json({ error: 'Influencer not found' });
    }

    if (managerId === null || managerId === '' || managerId === undefined) {
      influencer.manager = null;
    } else {
      const manager = await Employee.findById(managerId);
      if (!manager) {
        return res.status(400).json({ error: 'Manager not found' });
      }
      influencer.manager = managerId;
    }
    
    console.log('Saving influencer with manager:', influencer.manager);
    await influencer.save();
    
    const updatedInfluencer = await Influencer.findById(req.params.id).populate('manager');
    console.log('Updated influencer:', updatedInfluencer);
    
    res.json(updatedInfluencer);
  } catch (error) {
    console.error('Error updating manager:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.send(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).send(error);
  }
});

module.exports = router;