const User = require('../models/user.model');
const sendEmail = require('../utils/nodemailer');
const { CustomError } = require('../utils/handler');

// Set up multer for file uploads with memory storage
// const storage = multer.memoryStorage();

const sendMail = async (req, res) => {
    const { username, email, number, address, userId } = req.body;
    const file = req.file; // The uploaded file

    // console.log('Received data:', { username, email, number, address });
    // console.log('Received file:', file ? file.originalname : 'No file uploaded');

    // Validate the incoming data
    if (!username || !email || !number || !address) {
        throw new CustomError('Missing required fields', 400);
    }

    // Find the user by email and update the selfDeclaration field
    try {
        const user = await User.findOneAndUpdate(
            { userId: userId },
            { selfDeclaration: true },
            { new: true } // Return the updated document
        );

        if (!user) {
            throw new CustomError('User not found', 404);
        }

        // console.log('User selfDeclaration updated:', user);

        // Define email options
        let mailOptions = {
            from: 'tecnotecindia@gmail.com', // Sender address
            to: "hr@fucturicatechnologies.com", // Send the email to the address received in req.body
            subject: `Declaration details of ${username}`, // Subject line
            text: `Hello,
  
  Here are the details submitted by ${username}:
  
  Username: ${username}
  Email: ${email}
  Number: ${number}
  Address: ${address}
  
  Please find the attached document.
  
  Thank you!`,
            attachments: file ? [{
                filename: file.originalname,
                content: file.buffer // Attach the file directly from memory
            }] : [] // Attach the file if it exists
        };

        // Send the email
        let info = await sendEmail(mailOptions);
        console.log('Email sent successfully:', info);

        return res.status(200).json({ message: 'Email sent successfully and selfDeclaration updated!' });

    } catch (err) {
        console.error('Error sending email or updating user:', error);
        ApiError(err, res);
    }
};

module.exports = {
    sendMail,
}