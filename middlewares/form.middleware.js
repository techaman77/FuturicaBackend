const User = require('../models/user.model');
const { CustomError, ApiError } = require("../utils/handler");
const { verifyToken } = require("../utils/jwtToken");

const formMiddleware = async (req, res, next) => {
    const token = req.headers.authorization;
    try {

        const extractToken = await token?.split(' ')[1];

        if (!extractToken) {
            throw new CustomError('Token not found!', 401);
        }

        const decoded = await verifyToken(extractToken);

        if (!decoded) {
            throw new CustomError('Invalid token', 403);
        }

        const user = await User.findOne({ _id: decoded.user.id });

        if (!user) {
            throw new CustomError('User not found!', 404);
        }

        if (user.role !== 'admin') {
            throw new CustomError('Unauthorized access!', 403);
        }

        req.user = user;

        next();
    } catch (err) {
        console.error("Error: Fetching token in form middleware!", err.message)
        ApiError(err, res);
    }
};

module.exports = formMiddleware;