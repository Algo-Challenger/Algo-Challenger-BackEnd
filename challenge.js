'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// mongoose.connect(process.env.DB_URL);

const challengeSchema = new Schema ({
  template: {type: String, required: true},
  instructions: { type: String, required: true },
  test: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true }
});



const challengeModel = mongoose.model('Challenge', challengeSchema);

module.exports = challengeModel;