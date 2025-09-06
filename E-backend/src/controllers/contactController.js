const ContactMessage = require('../models/ContactMessage');

exports.create = async (req, res) => {
    try {
        const { category, message } = req.body;
        if (!category || !message) return res.status(400).json({ message: 'category and message required' });
        const doc = new ContactMessage({ userId: req.user ? req.user._id : null, category, message });
        await doc.save();
        res.status(201).json({ contact: doc });
    } catch (err) {
        console.error('create contact error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.list = async (req, res) => {
    try {
        const items = await ContactMessage.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json({ messages: items });
    } catch (err) {
        console.error('list contact messages error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markSeen = async (req, res) => {
    try {
        const msg = await ContactMessage.findById(req.params.id);
        if (!msg) return res.status(404).json({ message: 'Not found' });
        msg.isSeen = true;
        await msg.save();
        res.json({ message: msg });
    } catch (err) {
        console.error('markSeen error', err);
        res.status(500).json({ message: 'Server error' });
    }
};
