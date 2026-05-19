import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const ADMIN_NAME = 'Admin';
const ADMIN_EMAIL = 'admin@gatepass.com';
const ADMIN_PASSWORD = 'Admin@123';

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      admin = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin'
      });
      await admin.save();
      console.log('\n✅ Admin user created successfully!');
    } else {
      admin.name = ADMIN_NAME;
      admin.password = ADMIN_PASSWORD;
      admin.role = 'admin';
      await admin.save();
      console.log('\n✅ Admin user updated successfully!');
    }

    console.log('\n--- Admin Credentials ---');
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('-------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
