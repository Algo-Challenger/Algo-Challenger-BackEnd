'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL);
const Challenge = require('./challenge.js');
const axios = require("axios");
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;

app.get('/challenges', async (request, response, next) =>
{
	try
	{
		response.status(200).send(await Challenge.find());
	} catch (error)
	{
		next(error);
	}
});

app.get('/sendchallenge', async (request, response, next) =>
{
	const apiURL = "https://api.hackerearth.com/v4/partner/code-evaluation/submissions/";
	const submittedCode = request.body.code;
	const email = request.body.email;
	const challenge = await Challenge.findById(request.body.id);

	const body =
		{
			lang: "JAVASCRIPT_NODE",
			source: submittedCode + challenge.test
		};

	const header =
		{
			headers:
				{
					"client-secret": process.env.CLIENT_SECRET
				}
		};


	const firstResponse = await axios.post(apiURL, body, header);

	const updateURL = firstResponse.data.status_update_url;
	await delay(1000);

	const statusUpdate = await axios.get(updateURL, header);

	let resultURL = statusUpdate.data.result.run_status.output;

	let testResults = await axios.get(resultURL);

	response.status(200).send(testResults.data);
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));

function delay(milliseconds) { //TODO find a better way than this ?
	return new Promise(resolve => {
		setTimeout(resolve, milliseconds);
	});
}
