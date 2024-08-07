const express = require('express');
const formData = require('../model/formData'); // Assuming this is your Mongoose model
const router = express.Router();

// POST route to create a new form entry
router.post('/formData', async (req, res) => {
    try {
        const { 
            employeeId, name, contactNumber, qualification, extraQualifications, 
            experience, roleResponsibilities, skills, 
            fatherName, motherName, dateOfBirth, 
            maritalStatus, permanentAddress 
        } = req.body;

        // Validating the required fields
        if ( !employeeId || !name || !contactNumber || !qualification || !extraQualifications || 
            !experience || !roleResponsibilities || !skills || 
            !fatherName || !motherName || !dateOfBirth || 
            !maritalStatus || !permanentAddress) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Additional validation (example: checking if contactNumber is valid)
        const contactNumberPattern = /^[0-9]{10}$/;
        if (!contactNumberPattern.test(contactNumber)) {
            return res.status(400).json({ error: 'Invalid contact number.' });
        }

        // Count documents with the same employeeId
        const count = await formData.countDocuments({ employeeId });

        // Create and save the new form data
        const newFormData = new formData(req.body);
        await newFormData.save();

        res.status(201).json({ 
            msg: 'Form Data Added Successfully', 
            newFormData,
            count
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
