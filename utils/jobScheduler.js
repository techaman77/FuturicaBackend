const cron = require('node-cron');
const User = require('../models/user.model');

cron.schedule('0 0 * * *', async () => {
    try {
        const today = new Date();
        const dayBeforeYesterday = new Date(today);
        dayBeforeYesterday.setDate(today.getDate() - 2);
        dayBeforeYesterday.setHours(0, 0, 0, 0);

        const users = await User.updateMany(
            {},
            {
                $set: {
                    loggedIn: false,
                },
                $pull: {
                    workLogs: {
                        date: { $lte: dayBeforeYesterday }
                    }
                }
            }
        );
        console.log('Successfully reset loggedIn and workingHours for all users at 12 AM');
    } catch (err) {
        console.error('Error in resetting loggedIn and workingHours:', err.message);
    }
});