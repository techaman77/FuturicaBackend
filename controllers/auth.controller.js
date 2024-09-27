const { v4: uuidv4 } = require('uuid'); // For unique user IDs
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/nodemailer');
const { generateOtp, verifyOtp } = require('../utils/two-factor-auth');
const { CustomError, ApiError } = require('../utils/handler');
const { generateToken } = require('../utils/jwtToken');

const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check for missing required fields
        if (!name || !email || !password) {
            throw new CustomError('Please enter all required fields', 400);
        }

        // Check if the email already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new CustomError('User with this email already exists', 403);
        }

        // // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user with a unique userId
        let user = new User({
            userId: uuidv4(),
            name,
            email,
            password: hashedPassword,
            loggedIn: false,
            selfDeclaration: false,
            totalForms: 0,
            rejectedForms: 0,
            role: 'employee',
            isOtpRequired: false,
            lastLoginTime: null,
            workingHours: 0,
        });

        await user.save();

        return res.status(201).json({ message: 'User registered successfully', user });

    } catch (err) {
        console.error('Error: Registering user!', err.message);
        ApiError(err, res);
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for missing required fields
        if (!email || !password) {
            throw new CustomError('Please enter all required fields', 400);
        }

        // Check if the user exists
        let user = await User.findOne({ email });

        if (!user) {
            throw new CustomError('Cannot find email', 404);
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new CustomError('Wrong Password', 403);
        }

        // Check if the user is already logged in
        if (user.loggedIn) {
            throw new CustomError('User already logged in on another device', 403);
        }

        //To Do for all admins
        // if (user.role === 'admin') {
        //     user.isOtpRequired = true;
        //     await user.save();

        //     throw new CustomError('Otp required for login. Please contact admin.', 403);
        // }

        const today = new Date();

        if (today.getDay() === 'Sunday') {
            throw new CustomError(`You aren't allowed to work on Sundays. Enjoy!`, 500);
        }

        const isAllowedToLogin = await user.checkWorkingHours();

        if (user.isOtpRequired) {
            const otp = await generateOtp();

            if (!otp) {
                throw new CustomError('Otp not found!', 403);
            }

            const mailOptions = {
                from: process.env.NODEMAILER_USERNAME,
                to: process.env.SEND_TO_EMAIL,
                subject: 'Your OTP for 2FA',
                text: `Your OTP is: ${otp}`,
            };

            await sendEmail(mailOptions);

            throw new CustomError('Otp required for login. Please contact admin.', 403);
        }

        // Create and assign a token
        const payload = {
            user: {
                id: user.id
            }
        };

        const token = await generateToken(payload, '1h');

        if (!token) {
            throw new CustomError('Error generating token!', 400);
        }

        user.loggedIn = true;
        user.workLogs.push({
            date: new Date(),
            loginTime: new Date(),
            logoutTime: null,
            workingHours: 0,
        });
        await user.save();

        return res.status(200).json({ message: "User Logged In Successfully", token, user });
    } catch (err) {
        console.error('Error: Logging in user!', err.message);
        ApiError(err, res);
    }
};

const verificationOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        if (!otp || !email) {
            throw new CustomError('Please enter all required fields', 400);
        }

        const user = await User.findOne({ email });

        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const isVerified = await verifyOtp(otp);

        if (!isVerified) {
            throw new CustomError('Invalid OTP!', 403);
        }

        const today = new Date();
        const dayBeforeYesterday = new Date(today);
        dayBeforeYesterday.setDate(today.getDate() - 1);
        dayBeforeYesterday.setHours(0, 0, 0, 0);

        user.isOtpRequired = false;
        user.workLogs = [];
        await user.save();

        return res.status(200).json({ message: 'Otp verified successfully!', user });
    } catch (err) {
        console.error('Error:Verifying user!', err.message);
        ApiError(err, res);
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json(users);
    } catch (err) {
        console.error('Error: Fetching user.', err.message);
        ApiError(err, res);
    }
};

const searchUser = async (req, res) => {
    try {
        const { userId, email } = req.body;

        // Build the search query based on available fields
        let searchQuery = {};
        if (userId) searchQuery.userId = userId;
        if (email) searchQuery.email = email;

        if (Object.keys(searchQuery).length === 0) {
            throw new CustomError('Please provide userId or email to search.', 400);
        }

        // Find the user based on the search query
        const user = await User.findOne(searchQuery);

        if (!user) {
            throw new CustomError('User not found.', 404);
        }

        // Respond with the user details
        return res.status(200).json(user);
    } catch (err) {
        console.error('Error: Searching user.', err.message);
        ApiError(err, res);
    }
};

const updatePassword = async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    try {
        // Check for missing required fields
        if (!userId || !currentPassword || !newPassword) {
            throw new CustomError('Please enter all required fields', 400);
        }

        // if (currentPassword === newPassword) {
        //     throw new CustomError('Current password and new password cannot be same!', 400);
        // }

        // Find the user by userId
        let user = await User.findOne({ userId });

        if (!user) {
            throw new CustomError('User not found', 404);
        }

        // Compare current password with the stored hash
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            throw new CustomError('Current password is incorrect', 403);
        }

        // Hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error: Updating password', err.message);
        ApiError(err, res);
    }
};

const forgetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email }); // Corrected method

        if (!user) {
            throw new CustomError('User not found!', 404);
        }

        const otp = await generateOtp();

        let mailOptions = {
            from: process.env.NODEMAILER_USERNAME,
            to: email,
            subject: 'Password Reset',
            text: `Please enter the following OTP to reset your password: \n\n Your OTP is: ${otp}`,
        };

        await sendEmail(mailOptions);

        return res.status(200).json({ message: 'Password reset email sent' });
    } catch (err) {
        console.error('Error:Forget Password', err.message);
        ApiError(err, res);
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const isVerified = await verifyOtp(otp);

        if (!isVerified) {
            throw new CustomError('Invalid OTP', 403);
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword; // Ensure password is hashed before saving

        await user.save();

        return res.status(200).json({ message: 'Password reset successfully!' });
    } catch (err) {
        console.error('Error:Resetting password!', err.message);
        ApiError(err, res);
    }
};

const deleteUser = async (req, res) => {
    const { userId } = req.body;

    try {
        // Check for missing userId
        if (!userId) {
            throw new CustomError('UserId is required', 400);
        }

        // Find and delete the user
        const user = await User.findOneAndDelete({ userId });

        if (!user) {
            throw new CustomError('User not found', 404);
        }

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error:Deleting user', err.message);
        ApiError(err, res);
    }
};

const logout = async (req, res) => {
    const { userId } = req.body;

    try {
        // Check if the user exists
        let user = await User.findOne({ userId });
        if (!user) {
            throw new CustomError('Cannot find email', 404);
        }

        // Check if the user is logged in
        if (!user.loggedIn) {
            throw new CustomError('User is not logged in', 403);
        }

        const lastLoggedOut = new Date();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let lastRecord = await user.workLogs[user.workLogs.length - 1];
        let lastSecondRecord = await user.workLogs[user.workLogs.length - 2];

        const lastLoggedIn = lastRecord.loginTime;

        const duration = (lastLoggedOut - lastLoggedIn) / (1000 * 60 * 60);

        if (lastSecondRecord) {
            lastRecord.workingHours += lastSecondRecord.workingHours;
        }

        if (lastRecord) {
            lastRecord.workingHours += duration;
            lastRecord.logoutTime = lastLoggedOut;
        } else {
            await user.workLogs.push({ date: today, loginTime: null, logoutTime: today, workingHours: duration });
        }

        // Set the user as logged out
        user.loggedIn = false;

        await user.save();

        return res.status(200).json({ message: "User Logged Out Successfully" });
    } catch (err) {
        console.error('Error: Logging out user!', err.message);
        ApiError(err, res);
    }
};

module.exports = {
    register,
    login,
    verificationOtp,
    getUsers,
    searchUser,
    updatePassword,
    forgetPassword,
    resetPassword,
    deleteUser,
    logout,
};