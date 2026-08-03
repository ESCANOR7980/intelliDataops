require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');

async function resetTestUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB Connected');

        const email = 'test@example.com';
        const password = 'Test@12345';

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name: 'Test User',
                email: email,
                password: password,
                role: 'admin'
            });

            await user.save();

            console.log('TEST USER CREATED');
        } else {
            user.password = password;
            user.name = 'Test User';
            user.role = 'admin';

            await user.save();

            console.log('TEST USER PASSWORD RESET');
        }

        console.log('Email:', email);
        console.log('Password:', password);

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
    }
}

resetTestUser();