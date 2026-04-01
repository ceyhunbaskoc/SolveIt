const express = require('express');
const multer = require('multer');
const { 
    createIssue, 
    getAllIssues, 
    getIssueById, 
    getMyIssues,
    updateIssueStatus, 
    deleteIssue,
    upvoteIssue,
    downvoteIssue,
    addComment
} = require('../controllers/issueController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Optional upload middleware
const uploadOptional = multer().single('image');

// Public routes
router.get('/', getAllIssues);
router.get('/:id', getIssueById);

// Protected routes
router.get('/user/my-issues', protect, getMyIssues);
router.post('/', protect, uploadOptional, createIssue); 
router.patch('/:id/status', protect, updateIssueStatus); 
router.delete('/:id', protect, deleteIssue);
router.post('/:id/upvote', protect, upvoteIssue);
router.post('/:id/downvote', protect, downvoteIssue);
router.post('/:id/comments', protect, addComment);

module.exports = router;