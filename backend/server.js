const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const apiRoutes = require('./routes/api');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FEMMS';

const seedLoginUser = async () => {
    const username = process.env.SEED_USERNAME || 'admin';
    const password = process.env.SEED_PASSWORD || 'admin123';

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        console.log(`Seed user "${username}" already exists`);
        return;
    }

    await User.create({ username, password });
    console.log(`Seed user "${username}" created`);
};

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// MongoDB connection
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        await seedLoginUser();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Could not connect to MongoDB', err);
        process.exit(1);
    });