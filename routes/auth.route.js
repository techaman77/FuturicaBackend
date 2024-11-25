const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const formMiddleware = require("../middlewares/form.middleware");
const authController = require("../controllers/auth.controller");

// @route   POST api/users/register
// @desc    Register a user
// @access  Public

// router.post("/register", formMiddleware, authController.register);
router.post("/register", authController.register);

// @route   POST api/users/login
// @desc    Login a user
// @access  Public

router.post("/login", authController.login);

router.post("/otp/verify", authController.verificationOtp);

// @route   GET api/users
// @desc    Get all users
// @access  Private

router.get("/users", formMiddleware, authController.getUsers);

// @route   POST api/users/searchUser
// @desc    Search for a user by userId or email
// @access  Private

router.post("/user/search", authMiddleware, authController.searchUser);

// @route   PUT api/users/updatePassword
// @desc    Update a user's password
// @access  Private

router.put("/password/update", authMiddleware, authController.updatePassword);

router.post("/password/forget", authController.forgetPassword);

router.post("/password/reset", authController.resetPassword);

// @route   DELETE api/users/deleteUser
// @desc    Delete a user by userId
// @access  Private

router.delete("/user/delete", formMiddleware, authController.deleteUser); // Add delete user route

// @route   POST api/users/logout
// @desc    Logout a user
// @access  Private

router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
