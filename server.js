'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL);
const Challenge = require('./challenge.js');
const User = require('./user.js');
const axios = require("axios");
const {response} = require("express");
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

app.get("/user/:userId", async (request, response, next) =>
{
	try
	{
		const userId = request.params.userId;
		const user = await User.findById(userId);

		response.status(200).send(user);
	}
	catch (error)
	{
		next(error);
	}
});

app.put("/save", async (request, response, next) =>
{
	try
	{
		const userId = request.body.userId;
		const challengeId = request.body.challengeId;

		const user = await User.findById(userId);
		let savedChallenges = user.savedChallenges;

		savedChallenges.push(challengeId);

		await User.findByIdAndUpdate(userId, {savedChallenges: savedChallenges});

		response.status(200).send("Success");
	} catch (error)
	{
		next(error);
	}

});

// Adding in user to the database:
app.post('/user', async (request, response, next) =>
{
	try
	{
		let user = await User.findOne({name: request.body.name, email: request.body.email});

		if (!user)
		{
			user = await User.create({
				name: request.body.name,
				email: request.body.email,
				score: 0,
				challengesInitialized: [],
				savedChallenges: [],
			});
		}
		response.status(200).send(user);
	} catch (error)
	{
		next(error);
	}
});

app.post('/sendchallenge', async (request, response, next) =>
{
	try
	{
		const apiURL = "https://api.hackerearth.com/v4/partner/code-evaluation/submissions/";
		const code = request.body.code;
		const userId = request.body.userId;
		const challengeId = request.body.challengeId;
		const challenge = await Challenge.findById(challengeId);


		const body =
			{
				lang: "JAVASCRIPT_NODE",
				source: code + challenge.testCode
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

		await saveSubmission(userId, challengeId, code, testResults.data);

		response.status(200).send(testResults.data);
	} catch (error)
	{
		next(error);
	}
});

app.delete('/delete', async (request, response, next) =>
{
	try
	{
		const userId = request.body.userId;
		const challengeId = request.body.challengeId;


		const user = await User.findById(userId);

		let savedChallenges = user.savedChallenges;

		let index = savedChallenges.findIndex(challenge => challenge === challengeId);

		savedChallenges.splice(index, 1);

		await User.findByIdAndUpdate(userId, {savedChallenges: savedChallenges});

		response.status(200).send("Success");
	} catch (error)
	{
		next(error);
	}

});

app.delete('/user', async (request, response, next) =>
{
	try
	{
		const deleteUserId = request.body.userId;

		await User.findByIdAndDelete(deleteUserId);
		response.status(200).send("Success");

	} catch (error)
	{
		next(error);
	}
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));

async function saveSubmission(userId, challengeId, code, result)
{
	if (!result)
	{
		result = false;
	}

	const challenge = await Challenge.findById(challengeId);

	const savedSubmission = {
		challengeId: challengeId,
		challengeName: challenge.name,
		code: code,
		hasCompleted: result
	};

	const user = await User.findById(userId);

	let challengesInitialized = user.challengesInitialized;

	let challengeAlreadyExists = false;
	let firstTimePassed = result;
	challengesInitialized.forEach((value, index) =>
	{
		if (value.challengeId === challengeId)
		{
			if (challengesInitialized[index].hasCompleted)
			{
				savedSubmission.hasCompleted = true;
				firstTimePassed = false;
			}

			challengesInitialized[index] = savedSubmission;

			challengeAlreadyExists = true;
		}
	});

	if (firstTimePassed)
	{
		await addToScore(userId, 1);
	}

	if (!challengeAlreadyExists)
	{
		challengesInitialized.push(savedSubmission);
	}

	await User.findByIdAndUpdate(userId, {challengesInitialized: challengesInitialized});


}

async function addToScore(userId, score)
{
	const user = await User.findById(userId);
	let userScore = user.score;
	userScore += score;

	await User.findByIdAndUpdate(userId, {score: userScore});
}

function delay(milliseconds)
{ //TODO find a better way than this ?
	return new Promise(resolve =>
	{
		setTimeout(resolve, milliseconds);
	});
}
