const jwt = require("jsonwebtoken");

const generateToken = async (payload, expiry) => {
  try {
    const token = await jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: expiry } // Token expiration time
    );

    return token;
  } catch (err) {
    console.error("Error: Generating token", err.message);
  }
};

const verifyToken = async (token) => {
  try {
    const isVerified = await jwt.verify(token, process.env.JWT_SECRET);

    return isVerified;
  } catch (err) {
    console.error("Error: Verifying token", err.message);
  }
};

module.exports = { generateToken, verifyToken };
