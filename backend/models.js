// backend/models.js
const mongoose = require('mongoose');

const socialMediaAccountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  platform: { type: String, enum: ['Instagram', 'TikTok'], required: true }
});

const influencerSchema = new mongoose.Schema({
  firstName: { type: String, required: true, maxlength: 50 },
  lastName: { type: String, required: true, maxlength: 50 },
  socialMediaAccounts: [socialMediaAccountSchema],
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
});

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

const Influencer = mongoose.model('Influencer', influencerSchema);
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = { Influencer, Employee };