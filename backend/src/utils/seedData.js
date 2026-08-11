const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const Comment = require('../models/Comment');

dotenv.config({ path: './.env' });

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './.env' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cloudtask_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    console.log('[Seeder] Connected to MongoDB...');

    // Check if an Admin user exists
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      const admin = await User.create({
        name: 'Alex Rivera (Admin)',
        email: 'admin@cloudtask.com',
        password: 'password123',
        role: 'Admin',
        department: 'DevOps & Architecture',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });
      console.log(`[Seeder] Initial Admin account created (${admin.email}). No demo projects/tasks inserted.`);
    } else {
      console.log(`[Seeder] Existing Admin account found (${adminExists.email}). Database preserved.`);
    }

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seeder Error]:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
