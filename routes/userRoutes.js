// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT
const { v4: uuidv4 } = require('uuid'); // For unique user IDs
const User = require('../model/user');
require('dotenv').config(); // Load environment variables

// @route   POST api/users
// @desc    Register a user
// @access  Public
const login = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check for missing required fields
        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all required fields' });
        }

        // Check if the email already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user with a unique userId
        let user = new User({
            userId: uuidv4(),
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // Create and assign a token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }, // Token expiration time
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, user });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
router.post("/users", login);
module.exports = router;
