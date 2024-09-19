const express = require('express');
const multer = require('multer');
const User = require('../models/user.model');
const mailController = require('../controllers/mail.controller');

const router = express.Router();

// Set up multer for file uploads with memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/send-email', upload.single('file'), mailController.sendMail);

module.exports = router;
