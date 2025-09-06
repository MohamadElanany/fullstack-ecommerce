const Product = require('../models/Product');
const Category = require('../models/Category');

const ALLOWED_SECTIONS = ['mens','womens','unisex'];

function toSafeNumber(val, fallback = null) {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && val.trim() !== '') {
        const n = Number(val);
        return Number.isFinite(n) ? n : fallback;
    }
    return fallback;
}

exports.create = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, isActive, section } = req.body;
        if (!name || typeof price === 'undefined') {
        return res.status(400).json({ message: 'name and price required' });
        }

        const priceNum = toSafeNumber(price);
        const stockNum = toSafeNumber(stock, 0);
        if (priceNum === null) return res.status(400).json({ message: 'Invalid price' });
        if (stockNum === null) return res.status(400).json({ message: 'Invalid stock' });

        const photoPath = req.file ? (`/uploads/${req.file.filename}`) : (req.body.photo || '');

        let productSection = null;
        if (section && ALLOWED_SECTIONS.includes(section)) productSection = section;

        if (!productSection && categoryId) {
        const cat = await Category.findById(categoryId);
        if (!cat) return res.status(400).json({ message: 'categoryId not found' });
        if (cat.section) productSection = cat.section;
        }

        productSection = productSection || 'mens';

        const prod = new Product({
        name: name.trim(),
        description: description || '',
        price: priceNum,
        photo: photoPath,
        stock: Math.max(0, parseInt(stockNum, 10)),
        isActive: typeof isActive !== 'undefined' ? (isActive === 'true' || isActive === true) : true,
        categoryId: categoryId || null,
        section: productSection
        });

        await prod.save();
        res.status(201).json({ product: prod });
    } catch (err) {
        console.error('create product error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.update = async (req, res) => {
    try {
        const prod = await Product.findById(req.params.id);
        if (!prod || prod.isDeleted) return res.status(404).json({ message: 'Not found' });

        const { name, description, price, stock, categoryId, isActive, section } = req.body;

        if (typeof name !== 'undefined') prod.name = name.trim();
        if (typeof description !== 'undefined') prod.description = description;

        if (typeof price !== 'undefined') {
        const priceNum = toSafeNumber(price);
        if (priceNum === null) return res.status(400).json({ message: 'Invalid price' });
        prod.price = priceNum;
        }

        if (typeof stock !== 'undefined') {
        const stockNum = toSafeNumber(stock, null);
        if (stockNum === null) return res.status(400).json({ message: 'Invalid stock' });
        prod.stock = Math.max(0, parseInt(stockNum, 10));
        }

        if (typeof section !== 'undefined') {
        if (!ALLOWED_SECTIONS.includes(section)) {
            return res.status(400).json({ message: 'Invalid section value' });
        }
        prod.section = section;
        }

        if (typeof categoryId !== 'undefined') {
        prod.categoryId = categoryId || null;
        if (categoryId) {
            const cat = await Category.findById(categoryId);
            if (!cat) return res.status(400).json({ message: 'categoryId not found' });
            if (typeof section === 'undefined' && cat.section) prod.section = cat.section;
        } else {
            prod.section = prod.section || 'mens';
        }
        }

        if (typeof isActive !== 'undefined') prod.isActive = (isActive === 'true' || isActive === true);

        if (req.file) prod.photo = `/uploads/${req.file.filename}`;

        await prod.save();
        res.json({ product: prod });
    } catch (err) {
        console.error('update product error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.remove = async (req, res) => {
    try {
        const prod = await Product.findById(req.params.id);
        if (!prod) return res.status(404).json({ message: 'Not found' });
        prod.isDeleted = true;
        await prod.save();
        res.json({ message: 'Product soft-deleted' });
    } catch (err) {
        console.error('remove product error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.list = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, page = 1, limit = 20, q } = req.query;
        const filter = { isDeleted: false, isActive: true };

        if (category) filter.categoryId = category;
        if (typeof minPrice !== 'undefined') filter.price = Object.assign({}, filter.price, { $gte: Number(minPrice) });
        if (typeof maxPrice !== 'undefined') filter.price = Object.assign({}, filter.price, { $lte: Number(maxPrice) });
        if (q) filter.name = { $regex: q, $options: 'i' };

        if (req.query.section && ALLOWED_SECTIONS.includes(req.query.section)) {
        filter.section = req.query.section;
        }

        const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
        const [items, total] = await Promise.all([
        Product.find(filter).skip(skip).limit(Math.max(1, parseInt(limit, 10))).sort({ createdAt: -1 }),
        Product.countDocuments(filter)
        ]);

        res.json({ items, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        console.error('list products error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.get = async (req, res) => {
    try {
        const prod = await Product.findById(req.params.id).populate('categoryId', 'name section');
        if (!prod || prod.isDeleted || !prod.isActive) return res.status(404).json({ message: 'Not found' });
        res.json({ product: prod });
    } catch (err) {
        console.error('get product error', err);
        res.status(500).json({ message: 'Server error' });
    }
};
