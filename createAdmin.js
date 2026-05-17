import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    let admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      admin = new User({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: ' b',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created successfully.');
    } else {
      admin.role = 'admin';
      admin.password = 'password123';
      await admin.save();
      console.log('Admin user updated successfully.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
