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
        req.body.reporterId = req.user.id;

        console.log(`[INFO] Yeni sorun oluşturuluyor. Kullanıcı: ${req.user.name}, Başlık: ${req.body.title}`);
        
        const newIssue = await Issue.create(req.body);
        
        res.status(201).json({ 
            success: true, 
            data: newIssue 
        });
    } catch (error) {
        console.error("[ERROR] Sorun oluşturulamadı:", error.message);
        res.status(400).json({ 
            success: false, 
            message: "Hatalı İstek - Geçersiz veri", 
            error: error.message 
        });
    }
};

exports.updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        console.log(`[INFO] Updating issue status. ID: ${id}, New Status: ${status}`);
        
        const updatedIssue = await Issue.findByIdAndUpdate(
            id, 
            { status: status }, 
            { new: true, runValidators: true }
        );

        if (!updatedIssue) {
            console.warn(`[WARN] Issue not found with ID: ${id}`);
            return res.status(404).json({ 
                success: false, 
                message: "Issue not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: updatedIssue 
        });
    } catch (error) {
        console.error("[ERROR] Failed to update issue:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server Error", 
            error: error.message 
        });
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
        const issues = await Issue.find({ reporterId: req.user.id }).sort({ createdAt: -1 });

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
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ success: false, message: 'No issues were found for this ID.' });
        }

        res.status(200).json({ success: true, data: issue });
    } catch (error) {
        res.status(400).json({ success: false, message: 'iInvalid ID format.' });
    }
};

exports.updateIssueStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            { status },
            { returnDocument: 'after', runValidators: true }
        );

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        res.status(200).json({ success: true, data: issue });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// delete issue
exports.deleteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        if (issue.reporterId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete' });
        }

        await issue.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};