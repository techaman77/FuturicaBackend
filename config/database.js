const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connection successful!", connectionInstance.connection.host);
    } catch (err) {
        console.log("Mongoose connection failed!", err);
        process.exit(1);
    }
};

module.exports = connectDB;