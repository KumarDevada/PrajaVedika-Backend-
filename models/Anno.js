const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnnoSchema = new Schema({
  heading: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
})

const Anno = mongoose.model('Anno', AnnoSchema);

module.exports = Anno;