require("dotenv").config();
const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;

let client;

async function connectToMongo() {
    console.log('Attempting to connect to MongoDB...');
    try {
        client = new MongoClient(uri);
        await client.connect();
        console.log('Successfully connected to MongoDB.');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

app.get("/", async (req, res) => {
    try {
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
        res.status(500).send("Failed to update visit count");
    } finally {
    }

    res.sendFile(path.join(__dirname, "public", "index.html"));
});


connectToMongo().then(() => {
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
});
