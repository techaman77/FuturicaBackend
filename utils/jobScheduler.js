const cron = require('node-cron');
const User = require('../models/user.model');

cron.schedule('0 2 * * *', async () => {
    try {
        const users = await User.updateMany(
            {},
            {
                $set: {
                    loggedIn: false,
                    workingHours: 0,
                },
            }
        );
        console.log('Successfully reset loggedIn and workingHours for all users at 2 AM');
    } catch (err) {
        console.error('Error in resetting loggedIn and workingHours:', err);
    }
})