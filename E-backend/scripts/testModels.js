require('dotenv').config();
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

(async function(){
    try {
        await connectDB();
        console.log('DB connected — creating test user...');

        const user = new User({
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        password: 'pass123',
        phone: '01000000000'
        });

        await user.save();
        console.log('User created:', { id: user._id.toString(), email: user.email, name: user.name, role: user.role });

        await User.deleteOne({ _id: user._id });
        console.log('Test user removed — test OK.');

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
})();

