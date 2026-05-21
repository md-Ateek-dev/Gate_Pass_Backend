import GatePass from '../models/GatePass.js';

export const startCleanupJob = () => {
  const autoDeleteOldPasses = async () => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 360); // 360 days ago

      const result = await GatePass.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      console.log(`[Auto-Cleanup] Automatically deleted ${result.deletedCount} gate passes older than 360 days.`);
    } catch (error) {
      console.error('[Auto-Cleanup] Error running auto-cleanup for gate passes:', error);
    }
  };

  // Run immediately on server start
  setTimeout(autoDeleteOldPasses, 5000); // 5-second delay to ensure DB connection is ready

  // Schedule to run every 24 hours (24 * 60 * 60 * 1000 ms)
  setInterval(autoDeleteOldPasses, 24 * 60 * 60 * 1000);
};
