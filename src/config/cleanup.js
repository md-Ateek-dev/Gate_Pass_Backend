import mongoose from 'mongoose';
import GatePass from '../models/GatePass.js';

export const startCleanupJob = () => {
  const autoDeleteOldPasses = async () => {
    if (mongoose.connection.readyState !== 1) {
      console.warn('[Auto-Cleanup] Skipped — database not connected.');
      return;
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 360);

      const result = await GatePass.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      console.log(`[Auto-Cleanup] Deleted ${result.deletedCount} gate passes older than 360 days.`);
    } catch (error) {
      console.error('[Auto-Cleanup] Error:', error.message);
    }
  };

  setTimeout(autoDeleteOldPasses, 10000);
  setInterval(autoDeleteOldPasses, 24 * 60 * 60 * 1000);
};
