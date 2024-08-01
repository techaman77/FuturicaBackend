// middleware/validationMiddleware.js
const validateUserInput = (req, res, next) => {
    const { name, email, password } = req.body;

    // Check for missing required fields
    if (!name || !email || !password) {
        return res.status(400).json({ msg: 'Please enter all required fields' });
    }

    next();
};

module.exports = { validateUserInput };
