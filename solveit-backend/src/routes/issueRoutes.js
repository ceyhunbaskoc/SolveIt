const { protect, authorize } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const { 
    getAllIssues, 
    createIssue, 
    updateIssueStatus 
} = require('../controllers/issueController');

// GET /api/issues
router.get('/', getAllIssues);

// POST /api/issues
router.post('/', protect, createIssue);

// PATCH /api/issues/:id/status
router.patch('/:id/status', protect, authorize('admin'), updateIssueStatus);

module.exports = router;