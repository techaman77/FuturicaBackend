class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
};

// class ApiError extends Error {
//     constructor(
//         statusCode,
//         message = "Something went wrong",
//         errors = [],
//         stack = ""
//     ) {
//         super(message)
//         this.statusCode = statusCode
//         this.data = null
//         this.message = message
//         this.success = false;
//         this.errors = errors

//         if (stack) {
//             this.stack = stack
//         } else {
//             Error.captureStackTrace(this, this.constructor)
//         }

//     }
// };

const ApiError = (err, res) => {
    const status = err.status || 500;
    const message = err.message || "INTERNAL SERVER ERROR";
    const extraDetails = err.extraDetails || "Error from Backend details"
    return res.status(status).json({ msg: message, extraDetails });
}
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
};

module.exports = { CustomError, ApiResponse, ApiError };

