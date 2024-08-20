const express = require('express');
const spellchecker = require('spellchecker');
const formData = require('../model/formData'); // Assuming this is your Mongoose model
const router = express.Router();

// Function to check grammar and spelling
const checkGrammarAndSpelling = (text) => {
    let mistakesCount = 0;
    const sentences = text.split(/[.!?]\s+/); // Split by sentence-ending punctuation

    sentences.forEach(sentence => {
        // Check if the first letter is capitalized
        if (sentence.charAt(0) !== sentence.charAt(0).toUpperCase()) {
            mistakesCount++;
        }

        // Check spelling
        const words = sentence.split(/\s+/);
        words.forEach(word => {
            if (spellchecker.isMisspelled(word)) {
                mistakesCount++;
            }
        });
    });

    return mistakesCount;
};

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

        // Check grammar and spelling
        const allFieldsText = `${name} ${qualification} ${qualificationDetails} ${extraQualifications} ${extraQualificationsDetails} ${experience} ${roleResponsibilities} ${softSkills} ${technicalSkills} ${fatherName} ${motherName} ${dateOfBirth} ${maritalStatus} ${permanentAddress} ${profile} ${linkedIn} ${languages}`;
        const mistakesCount = checkGrammarAndSpelling(allFieldsText);

        // Determine status based on mistakesCount
        const formStatus = mistakesCount > 8 ? 'rejected' : 'approved';

        // Create and save the new form data with mistakesCount and status
        const newFormData = new formData({ ...req.body, mistakesCount, formStatus });
        await newFormData.save();

        // Count documents with the same employeeId after saving the new form data
        const count = await formData.countDocuments({ employeeId });

        // Send data to Google Sheets
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

module.exports = router;
