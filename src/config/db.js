import mongoose from 'mongoose';

const disconnectIfNeeded = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

const srvToStandardUri = (srvUri) => {
  if (!srvUri?.startsWith('mongodb+srv://')) return null;

  const withoutProtocol = srvUri.slice('mongodb+srv://'.length);
  const atIndex = withoutProtocol.indexOf('@');
  const slashIndex = withoutProtocol.indexOf('/', atIndex);

  if (atIndex === -1 || slashIndex === -1) return null;

  const credentials = withoutProtocol.slice(0, atIndex + 1);
  const hostAndRest = withoutProtocol.slice(atIndex + 1);
  const slashInRest = hostAndRest.indexOf('/');
  const host = hostAndRest.slice(0, slashInRest);
  const pathAndQuery = hostAndRest.slice(slashInRest);

  const separator = pathAndQuery.includes('?') ? '&' : '?';
  return `mongodb://${credentials}${host}:27017${pathAndQuery}${separator}tls=true`;
};

const tryConnect = async (uri, label) => {
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 12000,
    });
    console.log(`MongoDB Connected (${label}): ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] ${label} failed: ${error.message}`);
    await disconnectIfNeeded();
    return null;
  }
};

const connectDB = async () => {
  const atlasUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const localUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/GatePass_DB';
  const isDev = process.env.NODE_ENV !== 'production';
  const useLocalOnly = process.env.USE_LOCAL_MONGO === 'true';

  if (useLocalOnly) {
    const localConn = await tryConnect(localUri, 'Local');
    if (localConn) return localConn;
    console.error('USE_LOCAL_MONGO=true but local MongoDB is not running.');
    process.exit(1);
  }

  if (!atlasUri) {
    console.error('Error: MONGO_URI is not set in server/.env');
    process.exit(1);
  }

  let atlasConn = await tryConnect(atlasUri, 'Atlas');

  if (!atlasConn && atlasUri.startsWith('mongodb+srv://')) {
    const standardUri = srvToStandardUri(atlasUri);
    if (standardUri) {
      console.log('[MongoDB] Retrying with standard connection (DNS/SRV fallback)...');
      atlasConn = await tryConnect(standardUri, 'Atlas (standard)');
    }
  }

  if (atlasConn) return atlasConn;

  if (isDev) {
    console.log('[MongoDB] Trying local MongoDB...');
    const localConn = await tryConnect(localUri, 'Local');
    if (localConn) {
      console.warn('[MongoDB] Using LOCAL DB — Atlas data will not show here.');
      return localConn;
    }
  }

  console.error(`
MongoDB connection failed.

Fix Atlas (most common):
  1. https://cloud.mongodb.com → Network Access → Add IP Address
  2. "Add Current IP Address" or 0.0.0.0/0 (testing only) → Active
  3. Wait 2 minutes → npm run dev

If IP is already added, try:
  - Turn off VPN / change WiFi
  - Windows DNS: use 8.8.8.8
  - Atlas → Connect → copy NEW connection string into MONGO_URI

Local MongoDB (no Atlas):
  Install MongoDB Community, then in server/.env add:
  USE_LOCAL_MONGO=true
`);

  process.exit(1);
};

export default connectDB;
