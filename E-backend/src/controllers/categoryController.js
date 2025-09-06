const Category = require('../models/Category');

exports.create = async (req, res) => {
    try {
        const { name, parentCategoryId, section } = req.body;
        if(!name) return res.status(400).json({ message: 'Name required' });

        const allowed = ['mens','womens','unisex'];
        const sec = section && allowed.includes(section) ? section : 'mens';

        const existing = await Category.findOne({ name });
        if(existing) return res.status(400).json({ message: 'Category already exists' });

        const cat = new Category({ name, parentCategoryId: parentCategoryId || null, section: sec });
        await cat.save();
        res.status(201).json({ category: cat });
    } catch(err){
        console.error('create category error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.update = async (req, res) => {
    try {
        const { name, parentCategoryId, isActive, section } = req.body;
        const cat = await Category.findById(req.params.id);
        if(!cat) return res.status(404).json({ message: 'Not found' });

        if(typeof name !== 'undefined') cat.name = name;
        if(typeof parentCategoryId !== 'undefined') cat.parentCategoryId = parentCategoryId || null;
        if(typeof isActive !== 'undefined') cat.isActive = isActive;
        if(typeof section !== 'undefined' && ['mens','womens','unisex'].includes(section)) cat.section = section;

        await cat.save();
        res.json({ category: cat });
    } catch(err){
        console.error('update category error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.remove = async (req, res) => {
    try {
        const cat = await Category.findById(req.params.id);
        if(!cat) return res.status(404).json({ message: 'Not found' });
        cat.isDeleted = true;
        await cat.save();
        res.json({ message: 'Category soft-deleted' });
    } catch(err){
        console.error('remove category error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.list = async (req, res) => {
    try {
        const filter = { isDeleted: false, isActive: true };
        if(req.query.section && ['mens','womens','unisex'].includes(req.query.section)) {
        filter.section = req.query.section;
        }
        const categories = await Category.find(filter).sort({ name: 1 });
        res.json({ categories });
    } catch(err){
        console.error('list categories error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.get = async (req, res) => {
    try {
        const cat = await Category.findById(req.params.id);
        if(!cat || cat.isDeleted) return res.status(404).json({ message: 'Not found' });
        res.json({ category: cat });
    } catch(err){
        console.error('get category error', err);
        res.status(500).json({ message: 'Server error' });
    }
};
