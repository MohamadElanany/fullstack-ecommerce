const Testimonial = require('../models/Testimonial');

exports.add = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Text required' });
        const t = new Testimonial({ userId: req.user._id, text });
        await t.save();
        res.status(201).json({ testimonial: t });
    } catch (err) {
        console.error('add testimonial error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.listPublic = async (req, res) => {
    try {
        const items = await Testimonial.find({ isApproved: true }).populate('userId', 'name').sort({ createdAt: -1 });
        res.json({ testimonials: items });
    } catch (err) {
        console.error('list testimonials error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.listAll = async (req, res) => {
    try {
        const items = await Testimonial.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json({ testimonials: items });
    } catch (err) {
        console.error('list all testimonials error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.approve = async (req, res) => {
    try {
        const { approve } = req.body;
        const t = await Testimonial.findById(req.params.id);
        if (!t) return res.status(404).json({ message: 'Not found' });

        if (approve === true || approve === 'true') {
        t.isApproved = true;
        t.dateIsSeen = new Date();
        await t.save();
        return res.json({ testimonial: t });
        } else {
        await Testimonial.deleteOne({ _id: t._id });
        return res.json({ message: 'Testimonial rejected and removed' });
        }
    } catch (err) {
        console.error('approve testimonial error', err);
        res.status(500).json({ message: 'Server error' });
    }
};
