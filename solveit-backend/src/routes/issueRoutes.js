const express = require('express');
const { 
    createIssue, 
    getAllIssues, 
    getIssueById, 
    getMyIssues,
    updateIssueStatus, 
    deleteIssue        
} = require('../controllers/issueController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getAllIssues);
router.get('/:id', getIssueById);

// Protected routes
router.get('/user/my-issues', protect, getMyIssues);
router.post('/', protect, upload.single('image'), createIssue); 
router.patch('/:id/status', protect, updateIssueStatus); 
router.delete('/:id', protect, deleteIssue);             

module.exports = router;