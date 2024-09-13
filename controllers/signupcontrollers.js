// controllers/usersController.js
const users = require("../model/user");

const registerUser = async (req, resp) => {
    try {
        let user = new users(req.body);
        let result = await user.save();
        resp.send(result);
    } catch (error) {
        resp.status(500).send({ error: 'Failed to register user' });
    }
};

module.exports = registerUser;