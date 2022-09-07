'use strict'

const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema ({
  name: { type: String, required: true},
  email: { type: String, required: true},
  score: { type: Number, required: true},
  challengesInitialized: { type: Array, required: true},
  savedChallenges: {type: Array, required: true},
});

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;
