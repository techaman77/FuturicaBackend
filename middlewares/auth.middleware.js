const User = require("../models/user.model");
const { CustomError, ApiError } = require("../utils/handler");
const { verifyToken } = require("../utils/jwtToken");

const authMiddleware = async (req, res, next) => {
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

        req.user = user;

        next();
    } catch (err) {
        console.error("Error: Fetching token in auth middleware!", err.message)
        ApiError(err, res);
    }
};

module.exports = authMiddleware;