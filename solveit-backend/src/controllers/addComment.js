// Add comment to issue
exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim() === '') {
            return res.status(400).json({ success: false, message: 'Yorum metni boş olamaz' });
        }

        const issue = await Issue.findById(req.params.id);
        
        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        // Yorumu ekle
        issue.comments.push({
            user: req.user._id,
            text: text.trim()
        });

        await issue.save();

        // Populate ile yorumları çek
        const updatedIssue = await Issue.findById(req.params.id)
            .populate('reporterId', 'name email')
            .populate('upvotes', 'name')
            .populate('downvotes', 'name')
            .populate('comments.user', 'name role');

        // Socket.io ile bildirim gönder
        const io = req.app.get('socketio');
        if (io) {
            io.emit('newComment', { 
                issueId: issue._id, 
                comments: updatedIssue.comments 
            });
        }

        res.status(200).json({ success: true, data: updatedIssue });
    } catch (error) {
        console.error('addComment error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
