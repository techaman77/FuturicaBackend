const express = require('express');
const router = express.Router();
const formController = require('../controllers/form.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const formMiddleware = require('../middlewares/form.middleware');

// POST route to create a new form entry
router.post('/form/create', authMiddleware, formController.createForm);


// POST route to search forms by employeeId, serialNumber, or formattedDate
router.post('/form/search', formMiddleware, formController.searchForm);

module.exports = router;
