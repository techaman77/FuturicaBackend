const express = require('express');
const formData = require('../model/formData'); // Assuming this is your Mongoose model
const router = express.Router();

// POST route to create a new form entry
router.post('/formData', async (req, res) => {
    try {
        const { 
            employeeId, name, contactNumber, qualification, qualificationDetails, extraQualifications, 
            extraQualificationsDetails, experience, roleResponsibilities, 
            softSkills, technicalSkills, 
            fatherName, motherName, dateOfBirth, 
            maritalStatus, permanentAddress, profile, 
            linkedIn, languages 
        } = req.body;

        // Validating the required fields
        if ( !employeeId || !name || !contactNumber || !qualification || !qualificationDetails || !extraQualifications || !extraQualificationsDetails || 
            !experience || !roleResponsibilities || !softSkills || !technicalSkills ||
            !fatherName || !motherName || !dateOfBirth || 
            !maritalStatus || !permanentAddress || !profile || !linkedIn || !languages) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Additional validation (example: checking if contactNumber is valid)
        const contactNumberPattern = /^[0-9]{10}$/;
        if (!contactNumberPattern.test(contactNumber)) {
            return res.status(400).json({ error: 'Invalid contact number.' });
        }

        // Create and save the new form data
        const newFormData = new formData(req.body);
        await newFormData.save();

         // Fetch today's date and format it as (year-month-date)
         const today = new Date();
         const formattedDate = today.toISOString().split('T')[0]; // yyyy-mm-dd

        // Count documents with the same employeeId after saving the new form data
        const count = await formData.countDocuments({ employeeId, formattedDate });
        const totalCount = await formData.countDocuments({ employeeId })

        // Send data to Google Sheets
        // await axios.post(GOOGLE_SHEET_WEB_APP_URL, req.body);

        res.status(201).json({ 
            msg: 'Form Data Added Successfully', 
            newFormData,
            count,
            totalCount
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
