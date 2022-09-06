'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL);
const Challenge = require('./challenge.js');


const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

app.get('/challenges', async (request, response, next) => {
// future reference: async function

try{
response.status(200).send(await Challenge.find());
}
catch(error){
next(error)
}


});

app.listen(PORT, () => console.log(`listening on ${PORT}`));