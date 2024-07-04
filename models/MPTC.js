const mongoose = require('mongoose');

// Define the query schema
const querySchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  mandalName: {
    type: String,
    required: true
  },
  villageName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  mptc: {
    type: String,
    required: true
  },
  upvotes: {
    type: [String], // Array of Strings
    default: []
  },
  level: {
    type: String,
    required: true
  },
  resolved: {
    type: Boolean,
    default: false
  }
});

// Define the mptc schema
const mptcSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  queries: [querySchema]
});

// Create the model
const MPTC = mongoose.model('MPTC', mptcSchema);

module.exports = MPTC;
