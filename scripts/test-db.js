import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGO_URI;
console.log('Testing MongoDB Atlas connection...\n');

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log('SUCCESS — Atlas is reachable. Run: npm run dev');
  await mongoose.disconnect();
} catch (err) {
  console.error('FAILED —', err.message);
  console.error('\n→ Atlas → Network Access → Add Current IP → wait 2 min → npm run dev');
  process.exit(1);
}
