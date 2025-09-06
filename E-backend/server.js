require('dotenv').config();
const express = require('express');
const path = require('path');

const connectDB = require('./src/config/db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 14 * 24 * 60 * 60,
    }),
    cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 }
}));

app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

app.get('/ping', (req, res) => res.json({ ok: true, time: new Date() }));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/testimonials', require('./src/routes/testimonials'));
app.use('/api/contact', require('./src/routes/contact'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/admin',require('./src/routes/adminUserRoutes'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT} ✅`));
