const Order = require('../models/Order');
const mongoose = require('mongoose');


function parseDateRange(fromStr, toStr) {
    const from = fromStr ? new Date(fromStr) : new Date(0);
    let to = toStr ? new Date(toStr) : new Date();
    to.setHours(23, 59, 59, 999);
    return [from, to];
}


exports.sales = async (req, res) => {
    try {
        const { from: fromQ, to: toQ } = req.query;
        const [from, to] = parseDateRange(fromQ, toQ);

        const agg = await Order.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to }, isDeleted: false } },
        { $group: {
            _id: null,
            totalSales: { $sum: '$totalPrice' },
            ordersCount: { $sum: 1 }
        }},
        { $project: { _id: 0, totalSales: { $ifNull: ['$totalSales', 0] }, ordersCount: 1 } }
        ]);

        const report = agg[0] || { totalSales: 0, ordersCount: 0 };
        return res.json({ from: from.toISOString(), to: to.toISOString(), ...report });
    } catch (err) {
        console.error('reports.sales error', err);
        return res.status(500).json({ message: 'Server error' });
    }
};


exports.soldProducts = async (req, res) => {
    try {
        const { from: fromQ, to: toQ, limit: limitQ } = req.query;
        const [from, to] = parseDateRange(fromQ, toQ);
        const limit = Math.max(1, Math.min(100, parseInt(limitQ || '10'))); 

        const sold = await Order.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to }, isDeleted: false } },
        { $unwind: '$products' },
        { $group: {
            _id: '$products.productId',
            name: { $first: '$products.name' },
            unitsSold: { $sum: '$products.quantity' },
            revenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
        }},
        { $sort: { unitsSold: -1 } },
        { $limit: limit },
        { $project: { productId: '$_id', _id: 0, name: 1, unitsSold: 1, revenue: 1 } }
        ]);

        return res.json({
        from: from.toISOString(),
        to: to.toISOString(),
        count: sold.length,
        results: sold
        });
    } catch (err) {
        console.error('reports.soldProducts error', err);
        return res.status(500).json({ message: 'Server error' });
    }
};
