const express = require('express');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();

const app = express();
const port = 5000;
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect().then(() => {
    console.log("Connected to MongoDB");
}).catch(err => console.error("MongoDB connection error:", err));

const db = client.db('password_manager_mongo');
const collection = db.collection('passwords');

// GET all passwords
app.get('/', async (req, res) => {
    try {
        const passwords = await collection.find({}).toArray();
        res.json(passwords);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST - Save a password
app.post('/', async (req, res) => {
    try {
        const { site, username, password } = req.body;
        if (!site || !username || !password) {
            return res.status(400).json({ error: "Site, Username, and Password are required" });
        }
        const result = await collection.insertOne({ site, username, password });
        res.status(201).json({ success: true, result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE - Remove a password by ID
app.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ error: "No record found with this ID" });
        }
        res.json({ success: true, result: deleteResult });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Example Node.js/Express backend route for updating a password
app.put('/passwords/:id', async (req, res) => {
    try {
        const updatedPassword = req.body;
        const id = req.params.id;

        // Check if the ID is valid
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        // Perform the update
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedPassword }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Password not found' });
        }

        // Send the updated password details as a response
        const updatedRecord = await collection.findOne({ _id: new ObjectId(id) });
        res.json(updatedRecord);
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: 'Failed to update password' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
