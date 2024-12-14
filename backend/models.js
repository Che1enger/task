// backend/models.js
const mongoose = require('mongoose');

const socialMediaAccountSchema = new mongoose.Schema({
  username: { type: String, required: true },
  platform: { type: String, enum: ['Instagram', 'TikTok'], required: true }
});

const influencerSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true, 
    maxlength: 50,
    index: true 
  },
  lastName: { 
    type: String, 
    required: true, 
    maxlength: 50,
    index: true 
  },
  socialMediaAccounts: [socialMediaAccountSchema],
  manager: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee',
    index: true 
  }
});

const employeeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    index: true 
  }
});

// Create compound indexes for better search performance
influencerSchema.index({ firstName: 1, lastName: 1 });
influencerSchema.index({ manager: 1, firstName: 1, lastName: 1 });

const Influencer = mongoose.model('Influencer', influencerSchema);
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = { Influencer, Employee };