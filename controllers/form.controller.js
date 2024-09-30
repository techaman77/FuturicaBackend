const formData = require('../models/form.model');
const User = require('../models/user.model');
const { CustomError, ApiError } = require('../utils/handler');
const { checkGrammar } = require('../utils/languageTool');

const createForm = async (req, res) => {
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
        if (!employeeId || !name || !contactNumber || !qualification || !qualificationDetails || !extraQualifications || !extraQualificationsDetails ||
            !experience || !roleResponsibilities || !softSkills || !technicalSkills ||
            !fatherName || !motherName || !dateOfBirth ||
            !maritalStatus || !permanentAddress || !profile || !linkedIn || !languages || !serialNumber) {
            throw new CustomError('All fields are required.', 400);
        }

        // Additional validation (example: checking if contactNumber is valid)
        const contactNumberPattern = /^[0-9]{10}$/;
        if (!contactNumberPattern.test(contactNumber)) {
            throw new CustomError('Invalid contact number.', 403);
        }

        if (new Date().getDay() === 'Sunday') {
            throw new CustomError('Terms and Conditions violation.', 400);
        }

        // Create and save the new form data
        const newFormData = new formData(req.body);
        await newFormData.save();

        // Count documents with the same employeeId after saving the new form data
        const count = await formData.countDocuments({ employeeId });

        const text = Object.values(newFormData).join(' ');

        const grammarResponse = await checkGrammar(text);

        if (grammarResponse && grammarResponse.matches.length > 0) {
            const errorsCount = grammarResponse.matches.length;

            if (errorsCount > 3) {
                user.rejectedForms += 1;
            }
        }

        let user = await User.findOne({ userId: employeeId });

        if (!user) {
            throw new Error('User not found!', 404);
        }

        user.totalForms = count;
        await user.save();
        // Send data to Google Sheets
        //deleted
        // await axios.post(GOOGLE_SHEET_WEB_APP_URL, req.body);

        return res.status(201).json({
            message: 'Form Data Added Successfully',
            count,
            newFormData,
        });
    } catch (err) {
        console.error('Error: Creating new form.', err.message);
        ApiError(err, res);
    }
};

const searchForm = async (req, res) => {
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
            throw new CustomError('At least one of employeeId, serialNumber, or formattedDate must be provided', 400);
        }

        // Search the database for matching entries
        const forms = await formData.find(query);

        // If no forms are found, return a 404 error
        if (forms.length === 0) {
            throw new CustomError('No forms found matching the provided criteria', 404);
        }

        // Send the found forms to the frontend
        return res.status(200).json({ count: forms.length, forms });

    } catch (err) {
        // Handle any errors that occur during the process
        console.error('Error: Searching Form', err.message);
        ApiError(err, res);
    }
};

module.exports = {
    createForm,
    searchForm,
}