require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');

(async function(){
    await connectDB();
    console.log('Connected. Starting migration...');

    const products = await Product.find({ $or: [ { section: { $exists: false } }, { section: null } ] });
    console.log('Products to migrate:', products.length);
    for(const p of products){
        if(p.categoryId){
        const cat = await Category.findById(p.categoryId);
        if(cat && cat.section){
            p.section = cat.section;
            await p.save();
            console.log('Updated product', p._id.toString(), '-> section', p.section);
        } else {
            p.section = p.section || 'mens';
            await p.save();
            console.log('Defaulted product', p._id.toString(), '-> section', p.section);
        }
        } else {
        p.section = p.section || 'mens';
        await p.save();
        console.log('Defaulted product (no category)', p._id.toString(), '-> section', p.section);
        }
    }

    console.log('Migration complete');
    process.exit(0);
})();
