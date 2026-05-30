const Issue = require('../models/Issue');
const User = require('../models/User');
const { publishMessage } = require('../utils/rabbitmq');
const { getClient } = require('../utils/redis');

const CACHE_TTL = 60; // saniye

async function invalidateIssuesCache() {
    const client = getClient();
    if (!client) return;
    const keys = await client.keys('issues:*');
    if (keys.length > 0) await client.del(...keys);
}


// POST: Create New Issue
exports.createIssue = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        
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

        // Memory storage için Base64 handling (sadece resim varsa)
        if (req.file) {
            const base64Image = req.file.buffer.toString('base64');
            const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
            issueData.imageUrl = dataUrl;
        }

        console.log('Issue data:', issueData);

        const issue = await Issue.create(issueData);

        // Kullanıcıya +10 XP ekle
        const reporter = await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { xp: 10 } },
            { new: true }
        );

        // RabbitMQ: Yeni sorun kuyruğa gönder
        await publishMessage({
            event: 'NEW_ISSUE',
            issueId: issue._id.toString(),
            title: issue.title,
            category: issue.category,
            location: issue.location,
            reporterName: reporter?.name || 'Bilinmiyor',
            createdAt: issue.createdAt,
        });

        await invalidateIssuesCache();

        res.status(201).json({ success: true, data: issue });
    } catch (error) {
        console.error('Create issue error:', error);
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

        // 3. XP kontrolü ve Güncelle
        const wasNotResolved = issue.status !== 'RESOLVED';
        issue.status = status;
        await issue.save();

        // 4. XP güvenlik kontrolü: Sadece admin ve sadece bir kere
        if (status === 'RESOLVED' && wasNotResolved && !issue.xpAwarded && req.user.role === 'admin') {
            await User.findByIdAndUpdate(issue.reporterId, { $inc: { xp: 20 } });
            
            // XP verildiğini işaretle
            issue.xpAwarded = true;
            await issue.save();
        }

        // 5. Kaydettikten sonra populate edip Frontend'e gönder
        const updatedIssue = await Issue.findById(req.params.id).populate('reporterId', 'name email');
        
        await invalidateIssuesCache();

        // Socket.io ile bildirim gönder
        const io = req.app.get('socketio');
        if (io) {
            io.emit('statusUpdated', {
                issueId: issue._id,
                status: status,
                reporterId: issue.reporterId._id,
                message: `Sorununuzun durumu "${status === 'RESOLVED' ? 'Çözüldü' : status === 'IN_PROGRESS' ? 'İnceleniyor' : 'Beklemede'}" olarak güncellendi!`
            });
        }

        res.status(200).json({ success: true, data: updatedIssue });
    } catch (error) {
        console.error('updateIssueStatus error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getAllIssues = async (req, res) => {
    try {
        const category = req.query.category || 'all';
        const cacheKey = `issues:${category}`;
        const client = getClient();

        if (client) {
            const cached = await client.get(cacheKey);
            if (cached) {
                console.log('[REDIS] Cache hit:', cacheKey);
                const data = JSON.parse(cached);
                return res.status(200).json({ success: true, count: data.length, data, fromCache: true });
            }
        }

        const query = {};
        if (req.query.category) query.category = req.query.category;

        const issues = await Issue.find(query).populate('reporterId', 'name email').sort({ createdAt: -1 });

        if (client) {
            await client.setex(cacheKey, CACHE_TTL, JSON.stringify(issues));
            console.log('[REDIS] Cache set:', cacheKey, `(TTL: ${CACHE_TTL}s)`);
        }

        res.status(200).json({ success: true, count: issues.length, data: issues });
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
        const issue = await Issue.findById(req.params.id)
            .populate('reporterId', 'name email')
            .populate('comments.user', 'name role');

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
        await invalidateIssuesCache();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error('deleteIssue error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.upvoteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        // Kendi açtığı soruna oy veremez kontrolü
        if (issue.reporterId.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Kendi açtığınız soruna oy veremezsiniz.' });
        }

        const userId = req.user._id.toString();
        const upvotes = issue.upvotes.map(id => id.toString());
        const downvotes = issue.downvotes.map(id => id.toString());

        // Toggle mantığı
        if (upvotes.includes(userId)) {
            // Zaten upvote etmişse, upvotes'tan çıkar
            issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId);
        } else {
            // Downvote etmişse, downvotes'tan çıkar
            if (downvotes.includes(userId)) {
                issue.downvotes = issue.downvotes.filter(id => id.toString() !== userId);
            }
            // Upvotes'a ekle
            issue.upvotes.push(req.user._id);
        }

        await issue.save();

        // Populate edip gönder
        const updatedIssue = await Issue.findById(req.params.id).populate('reporterId', 'name email').populate('upvotes', 'name').populate('downvotes', 'name');
        const io = req.app.get('socketio');
io.emit('voteUpdated', { 
    issueId: updatedIssue._id, 
    upvotes: updatedIssue.upvotes, 
    downvotes: updatedIssue.downvotes 
});
        res.status(200).json({ success: true, data: updatedIssue });
    } catch (error) {
        console.error('upvoteIssue error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.downvoteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        // Kendi açtığı soruna oy veremez kontrolü
        if (issue.reporterId.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Kendi açtığınız soruna oy veremezsiniz.' });
        }

        const userId = req.user._id.toString();
        const upvotes = issue.upvotes.map(id => id.toString());
        const downvotes = issue.downvotes.map(id => id.toString());

        // Toggle mantığı
        if (downvotes.includes(userId)) {
            // Zaten downvote etmişse, downvotes'tan çıkar
            issue.downvotes = issue.downvotes.filter(id => id.toString() !== userId);
        } else {
            // Upvote etmişse, upvotes'tan çıkar
            if (upvotes.includes(userId)) {
                issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId);
            }
            // Downvotes'a ekle
            issue.downvotes.push(req.user._id);
        }

        await issue.save();

        // Populate edip gönder
        const updatedIssue = await Issue.findById(req.params.id).populate('reporterId', 'name email').populate('upvotes', 'name').populate('downvotes', 'name');
        
        const io = req.app.get('socketio');
io.emit('voteUpdated', { 
    issueId: updatedIssue._id, 
    upvotes: updatedIssue.upvotes, 
    downvotes: updatedIssue.downvotes 
});
        res.status(200).json({ success: true, data: updatedIssue });
    } catch (error) {
        console.error('downvoteIssue error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

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