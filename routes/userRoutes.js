// routes/userRoutes.js
const express = require('express');
const router = express.Router();

const { validateUserInput } = require('../middleware/validationMiddleware');
const User = require('../models/user');

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post('/users', validateUserInput, async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = new User({
            name,
            email,
            password
        });

        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
