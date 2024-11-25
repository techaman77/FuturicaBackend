require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/database");
const authRoute = require("./routes/auth.route");
const mailRoute = require("./routes/mail.route");
const formRoute = require("./routes/form.route");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

connectDB();

// Define routes
app.use("/api/v1", authRoute);
app.use("/api/v1", formRoute);
app.use("/api/v1", mailRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
