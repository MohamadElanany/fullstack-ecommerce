const mongoose = require('mongoose');

async function connectDB(){
    if(!process.env.MONGO_URI){
        console.error('MONGO_URI not set in environment');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        });
        console.log('MongoDB connected (Atlas)');
    } catch (err) {
        console.error('MongoDB connection error:', err.message || err);
        process.exit(1);
    }
}

module.exports = connectDB;
