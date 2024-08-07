const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the user data
const formDataSchema = new Schema({
    employeeId: { type: String, required: true },
    name: { type: String, required: true },
    contactNumber: { type: String, required: true },
    qualification: { type: String, required: true },
    extraQualifications: [{ type: String }], // Array of strings
    experience: { type: String, required: true },
    roleResponsibilities: { type: String, required: true },
    skills: [{ type: String }], // Array of strings
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    maritalStatus: { type: String, required: true },
    permanentAddress: { type: String, required: true }
}, { timestamps: true });
// Adds createdAt and updatedAt fields automatically

// Export the model
module.exports = mongoose.model('formData', formDataSchema);
