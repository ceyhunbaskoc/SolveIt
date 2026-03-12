const Issue = require('../models/Issue');

// Çözülmüş sorunları 1 gün sonra otomatik sil
const cleanupOldIssues = async () => {
  try {
    console.log('[INFO] Starting cleanup of old resolved issues...');
    
    // 1 gün öncesinin tarihi
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Çözülmüş ve 1 günden eski sorunları bul
    const oldResolvedIssues = await Issue.find({
      status: 'RESOLVED',
      updatedAt: { $lt: oneDayAgo }
    });
    
    if (oldResolvedIssues.length > 0) {
      // Sil
      const result = await Issue.deleteMany({
        status: 'RESOLVED',
        updatedAt: { $lt: oneDayAgo }
      });
      
      console.log(`[INFO] Deleted ${result.deletedCount} old resolved issues`);
    } else {
      console.log('[INFO] No old resolved issues to delete');
    }
    
  } catch (error) {
    console.error('[ERROR] Failed to cleanup old issues:', error.message);
  }
};

module.exports = cleanupOldIssues;
