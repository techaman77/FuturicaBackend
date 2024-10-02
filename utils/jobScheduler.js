const cron = require('node-cron');
const User = require('../models/user.model');

cron.schedule('0 0 * * *', async () => {
    try {
        const today = new Date();
        const dayBeforeYesterday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 2, 0, 0, 0));

        const result = await User.updateMany(
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

        console.log(`Successfully reset loggedIn and removed old workLogs for ${result.modifiedCount} users at 12 AM`);
    } catch (err) {
        console.error('Error in resetting loggedIn and workingHours:', err.message);
    }
});
