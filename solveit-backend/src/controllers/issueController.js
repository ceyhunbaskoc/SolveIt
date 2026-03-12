const Issue = require('../models/Issue');

// GET: List all issues
exports.getAllIssues = async (req, res) => {
    try {
        console.log("[INFO] Fetching all issues from the database...");
        
        const issues = await Issue.find().sort({ createdAt: -1 }); 
        
        res.status(200).json({ 
            success: true, 
            count: issues.length, 
            data: issues 
        });
    } catch (error) {
        console.error("[ERROR] Failed to fetch issues:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server Error", 
            error: error.message 
        });
    }
};

// POST: Create New Issue
exports.createIssue = async (req, res) => {
    try {
        let locationData = req.body.location;
        if (typeof locationData === 'string') {
            locationData = JSON.parse(locationData);
        }

        const issueData = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            location: locationData,
            reporterId: req.user._id,
            status: 'PENDING'
        };

        if (req.file) {
            issueData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const issue = await Issue.create(issueData);
        res.status(201).json({ success: true, data: issue });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.updateIssueStatus = async (req, res) => {
    try {
        const { status } = req.body;
        // 1. Populate ETMEDEN buluyoruz (save hatasını önlemek için)
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        // 2. Yetki Kontrolü (Admin veya Sorun Sahibi)
        const isAdmin = req.user.role === 'admin';
        const reporterIdString = issue.reporterId ? issue.reporterId.toString() : '';
        const isOwner = reporterIdString === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
        }

        // 3. Güncelle ve Kaydet
        issue.status = status;
        await issue.save();

        // 4. Kaydettikten sonra populate edip Frontend'e gönder
        const updatedIssue = await Issue.findById(req.params.id).populate('reporterId', 'name email');
        res.status(200).json({ success: true, data: updatedIssue });
    } catch (error) {
        console.error('updateIssueStatus error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getAllIssues = async (req, res) => {
    try {
        const query = {};
        if (req.query.category) {
            query.category = req.query.category;
        }

        const issues = await Issue.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: issues.length,
            data: issues
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getMyIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ reporterId: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: issues.length,
            data: issues
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getIssueById = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id).populate('reporterId', 'name email');

        if (!issue) {
            return res.status(404).json({ success: false, message: 'No issues were found for this ID.' });
        }

        res.status(200).json({ success: true, data: issue });
    } catch (error) {
        res.status(400).json({ success: false, message: 'iInvalid ID format.' });
    }
};

// delete issue
exports.deleteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        const isAdmin = req.user.role === 'admin';
        const reporterIdString = issue.reporterId ? issue.reporterId.toString() : '';
        const isOwner = reporterIdString === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
        }

        await issue.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error('deleteIssue error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};