const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

const mongoUrl = "mongodb://dbadmin:12345678@localhost:27017/?authSource=admin";
const dbName = "test";
const collectionName = "counters";

app.get("/", async (req, res) => {
	const client = new MongoClient(mongoUrl);

	try {
		await client.connect();
		const db = client.db(dbName);
		const collection = db.collection(collectionName);

		const result = await collection.findOneAndUpdate(
			{ name: "visits" },
			{ $inc: { count: 1 } },
			{ upsert: true, returnDocument: "after" }
		);

		console.log(`Visit count: ${result.value.count}`);
	} catch (err) {
		console.error("Failed to update visit count", err);
	} finally {
		await client.close();
	}

	res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
