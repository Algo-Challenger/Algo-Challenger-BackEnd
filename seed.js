'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL);

const Challenge = require('./challenge.js');
const Challenges = require('./challenges.json');
// const {default: mongoose} = require("mongoose");

async function seed(){
 Challenges.forEach(async (value) => {
  await Challenge.create(value)
 });
 console.log('Seeded, closing connection');
}
// mongoose.disconnect();

console.log(Challenges);
seed();