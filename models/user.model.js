// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const workingHoursSchema = new Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    loginTime: {
        type: Date,
        default: null,
    },
    logoutTime: {
        type: Date,
        default: null,
    },
    workingHours: {
        type: Number,
        default: 0,
    },
});

const UserSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    totalForms: {
        type: Number,
        default: 0,
    },
    rejectedForms: {
        type: Number,
        default: 0,
    },
    loggedIn: {
        type: Boolean,
        default: false
    },
    selfDeclaration: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'employee',
    },
    isOtpRequired: {
        type: Boolean,
        default: false,
    },
    workLogs: [workingHoursSchema],
});

//premethod
// UserSchema.pre("save", async function (next) {
//     //is Modified don't do anything and simply move to next step
//     if (!this.isModified()) {
//         //next step which is saving data in database
//         next();
//     }
//     try {
//         // console.log(this.password);
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(this.password, salt);
//         this.password = hashedPassword;
//     } catch (error) {
//         console.error(error);
//     }
// });

UserSchema.methods.checkWorkingHours = async function () {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdaysRecords = await this.workLogs?.filter(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === yesterday.getTime();
    });

    const yesterdaysRecord = yesterdaysRecords[yesterdaysRecords.length - 1]

    if (this.role !== 'admin') {
        if (yesterdaysRecord && yesterdaysRecord.workingHours < 6) {
            this.isOtpRequired = true;
        } else {
            this.isOtpRequired = false;
        }
    }

    return this.isOtpRequired;
}

UserSchema.methods.checkPassword = async function (password) {
    try {
        console.log("Stored hashed password:", this.password);
        const isMatch = await bcrypt.compare(password, this.password);
        console.log("Password match result:", isMatch);
        return isMatch;
    } catch (error) {
        console.error("Error comparing password:", error);
        throw error; // Ensure the error is properly propagated
    }
};


module.exports = mongoose.model('User', UserSchema);
