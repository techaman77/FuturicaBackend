// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT
const { v4: uuidv4 } = require('uuid'); // For unique user IDs
const User = require('../model/user');
require('dotenv').config(); // Load environment variables

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
// routes/userRoutes.js
const register = async (req, res) => {
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
            password: hashedPassword,
            loggedIn: false ,// Set default login state
            selfDeclaration : false
        });

        await user.save();

        res.status(201).json({ msg: 'User registered successfully', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


// @route   POST api/users/login
// @desc    Login a user
// @access  Public
// routes/userRoutes.js
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for missing required fields
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter all required fields' });
        }

        // Check if the user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Cannot find email' });
        }

        // Check if the user is already logged in
        if (user.loggedIn) {
            return res.status(400).json({ msg: 'User already logged in on another device' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Wrong Password' });
        }

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
            async (err, token) => {
                if (err) throw err;

                // Set the user as logged in
                user.loggedIn = true;
                await user.save();

                res.status(200).json({ msg: "User Logged In Successfully", token, user });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
// routes/userRoutes.js
const logout = async (req, res) => {
    const { userId } = req.body;

    try {
        // Check if the user exists
        let user = await User.findOne({ userId });
        if (!user) {
            return res.status(400).json({ msg: 'Cannot find email' });
        }

        // Check if the user is logged in
        if (!user.loggedIn) {
            return res.status(400).json({ msg: 'User is not logged in' });
        }

        // Set the user as logged out
        user.loggedIn = false;
        await user.save();

        res.status(200).json({ msg: "User Logged Out Successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

router.post("/logout", logout);
router.post("/register", register);
router.post("/login", login);

module.exports = router;
