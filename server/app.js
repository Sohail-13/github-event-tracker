require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;

let db;

// Middleware
app.use(cors()); // Enable CORS for UI
app.use(bodyParser.json());

// Connect to MongoDB
MongoClient.connect(mongoUri)
    .then(client => {
        db = client.db();
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit if DB connection fails
    });

// Webhook endpoint
app.post('/webhook', async(req, res) => {
    const eventData = req.body;
    console.log('Received webhook:', eventData);

    // Validate incoming data (basic)
    if (!eventData.eventType || !eventData.author || !eventData.timestamp) {
        return res.status(400).send('Missing required event data');
    }

    try {
        const eventsCollection = db.collection('events');
        await eventsCollection.insertOne({
            ...eventData,
            receivedAt: new Date(), // Add a timestamp for when it was received
        });
        console.log('Event stored in MongoDB');
        res.status(200).send('Webhook received and stored');
    } catch (error) {
        console.error('Error storing event:', error);
        res.status(500).send('Error processing webhook');
    }
});

// API endpoint to get latest events
app.get('/events', async(req, res) => {
    try {
        const eventsCollection = db.collection('events');
        // Fetch latest 100 events, sorted by receivedAt in descending order
        const events = await eventsCollection.find({})
            .sort({ receivedAt: -1 })
            .limit(100)
            .toArray();
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error fetching events');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});