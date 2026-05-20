import GatePass from '../models/GatePass.js';

export const startCleanupJob = () => {
  const autoDeleteOldPasses = async () => {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30); // 30 days ago

      const result = await GatePass.deleteMany({
        createdAt: { $lt: oneMonthAgo }
      });

      console.log(`[Auto-Cleanup] Automatically deleted ${result.deletedCount} gate passes older than 30 days (1 month).`);
    } catch (error) {
      console.error('[Auto-Cleanup] Error running auto-cleanup for gate passes:', error);
    }
  };

  // Run immediately on server start
  setTimeout(autoDeleteOldPasses, 5000); // 5-second delay to ensure DB connection is ready

  // Schedule to run every 24 hours (24 * 60 * 60 * 1000 ms)
  setInterval(autoDeleteOldPasses, 24 * 60 * 60 * 1000);
};
