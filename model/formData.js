const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const today = new Date();
// Define the schema for the user data
const formDataSchema = new Schema({
    employeeId: {
         type: String,
         required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    contactNumber: { 
        type: String, 
        required: true 
    },
    qualification: [{ 
        type: String, 
        required: true 
    }],
    qualificationDetails: {
        10: { 
            type: String, 
            default: '' 
        },
        12: { 
            type: String, 
            default: '' 
        },
        Graduation: { 
            type: String, 
            default: '' 
        }
    },
    extraQualifications: [{ 
        type: String 
    }], // Array of strings
    extraQualificationsDetails: {
        Certification: { 
            type: String, 
            default: '' 
        },
        Diploma: { 
            type: String, 
            default: '' 
        }
    },
    experience: [{ 
        type: String 
    }], // Array of strings
    roleResponsibilities: { 
        type: String, 
        required: true 
    },
    softSkills: [{ 
        type: String 
    }], // Array of strings
    technicalSkills: [{ 
        type: String 
    }], // Array of strings
    fatherName: { 
        type: String, 
        required: true 
    },
    motherName: { 
        type: String, 
        required: true 
    },
    dateOfBirth: { 
        type: String, 
        required: true 
    },
    maritalStatus: { 
        type: String, 
        required: true 
    },
    permanentAddress: { 
        type: String, 
        required: true 
    },
    profile: { 
        type: String, 
        default: '' 
    },
    linkedIn: { 
        type: String, 
        default: '' 
    },
    languages: [{ 
        type: String 
    }], // Array of strings
    mistakesCount : {
        type: Number,
        default: 0
    },
    formattedDate: {
        type: String,
        default: today.toISOString().split('T')[0]
    },
    serialNumber : {
        type : String,
    }

}, { timestamps: true });
// Adds createdAt and updatedAt fields automatically

// Export the model
module.exports = mongoose.model('formData', formDataSchema);
