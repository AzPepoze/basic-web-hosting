require("dotenv").config();
const express = require("express");
const path = require("path");
const https = require("https");
const fs = require("fs");
const { MongoClient } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

const sslOptions = {
	key: fs.readFileSync(path.join(__dirname, "key.pem")),
	cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
};

const mongo_url = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;

let client;

async function connectToMongo() {
	console.log("Attempting to connect to MongoDB...");
	try {
		client = new MongoClient(mongo_url);
		await client.connect();
		console.log("Successfully connected to MongoDB.");
	} catch (err) {
		console.error("Failed to connect to MongoDB", err);
		process.exit(1);
	}
}

app.get("/", async (req, res) => {
	let visitCount = 0;
	try {
		const db = client.db(dbName);
		const collection = db.collection(collectionName);

		const result = await collection.findOneAndUpdate(
			{ name: "visits" },
			{ $inc: { count: 1 } },
			{ upsert: true, returnDocument: "after" }
		);

		if (result) {
			visitCount = result.count;
			console.log(`Visit count: ${visitCount}`);
		}
	} catch (err) {
		console.error("Failed to update visit count", err);
	}

	res.sendFile(path.join(__dirname, "public", "index.html"));
});

connectToMongo().then(() => {
	https.createServer(sslOptions, app).listen(port, () => {
		console.log(`Server listening at https://localhost:${port}`);
	});
});
