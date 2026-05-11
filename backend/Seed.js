const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const seedAdminUser = async () => {
    try {
        console.log('Starting database seeding...');

        // Seed Admin User
        const adminUsername = process.env.SEED_USERNAME || 'admin';
        const adminPassword = process.env.SEED_PASSWORD || 'admin123';

        const existingUser = await User.findOne({ username: adminUsername });
        if (existingUser) {
            await User.deleteOne({ username: adminUsername });
            console.log(`Deleted existing admin user "${adminUsername}"`);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        await User.create({ username: adminUsername, password: hashedPassword });
        console.log(`Admin user "${adminUsername}" created successfully`);

        console.log('Database seeding completed successfully!');
        
        console.log('\nNote: Equipment, Technicians, and Maintenance records should be created by the admin through the API endpoints.');

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    require('dotenv').config();

    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FEPMS';

    mongoose.connect(MONGODB_URI)
        .then(async () => {
            console.log('Connected to MongoDB for seeding');
            await seedAdminUser();
            await mongoose.disconnect();
            console.log('Seeding complete, disconnected from MongoDB');
        })
        .catch(err => {
            console.error('Could not connect to MongoDB for seeding', err);
            process.exit(1);
        });
}

module.exports = { seedAdminUser };