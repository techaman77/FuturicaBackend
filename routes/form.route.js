const express = require('express');
const router = express.Router();
const formController = require('../controllers/form.controller');

// POST route to create a new form entry
router.post('/formData', formController.createForm);


// POST route to search forms by employeeId, serialNumber, or formattedDate
router.post('/search-forms', formController.searchForm);

module.exports = router;
