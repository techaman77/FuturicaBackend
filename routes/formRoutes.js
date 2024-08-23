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
            linkedIn, languages, serialNumber 
        } = req.body;

        // Validating the required fields
        if ( !employeeId || !name || !contactNumber || !qualification || !qualificationDetails || !extraQualifications || !extraQualificationsDetails || 
            !experience || !roleResponsibilities || !softSkills || !technicalSkills ||
            !fatherName || !motherName || !dateOfBirth || 
            !maritalStatus || !permanentAddress || !profile || !linkedIn || !languages || !serialNumber) {
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
        
        // Send data to Google Sheets
        //deleted
        // await axios.post(GOOGLE_SHEET_WEB_APP_URL, req.body);

        res.status(201).json({ 
            msg: 'Form Data Added Successfully', 
            newFormData,
            count
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// POST route to search forms by employeeId, serialNumber, or formattedDate
router.post('/search-forms', async (req, res) => {
    try {
        const { employeeId, serialNumber, formattedDate } = req.body;

        // Build a dynamic query object based on the provided fields
        const query = {};
        if (employeeId) {
            query.employeeId = employeeId;
        }
        if (serialNumber) {
            query.serialNumber = serialNumber;
        }
        if (formattedDate) {
            query.formattedDate = formattedDate;
        }

        // Check if at least one search parameter is provided
        if (Object.keys(query).length === 0) {
            return res.status(400).json({ error: 'At least one of employeeId, serialNumber, or formattedDate must be provided' });
        }

        // Search the database for matching entries
        const forms = await formData.find(query);

        // If no forms are found, return a 404 error
        if (forms.length === 0) {
            return res.status(404).json({ message: 'No forms found matching the provided criteria' });
        }

        // Send the found forms to the frontend
        res.status(200).json(forms);

    } catch (err) {
        // Handle any errors that occur during the process
        console.error('Error while searching for forms:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
