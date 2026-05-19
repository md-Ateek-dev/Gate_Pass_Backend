import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import GatePass from './src/models/GatePass.js';

dotenv.config();

const cleanDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Remove all users except admin@gatepass.com
    const resultUsers = await User.deleteMany({ email: { $ne: 'admin@gatepass.com' } });
    console.log(`Deleted ${resultUsers.deletedCount} old users (Kept admin@gatepass.com).`);

    // Remove all gate passes
    const resultPasses = await GatePass.deleteMany({});
    console.log(`Deleted ${resultPasses.deletedCount} old gate passes.`);

    console.log('\n✅ Database cleaned successfully! Only admin@gatepass.com remains.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanDatabase();
