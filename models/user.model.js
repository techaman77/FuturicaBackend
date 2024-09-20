// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

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
    }
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
