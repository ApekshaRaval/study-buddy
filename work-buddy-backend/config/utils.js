const jwt = require('jsonwebtoken');
require('dotenv').config()
const generateAuthToken = (userData) => {
    const token = jwt.sign({ id: userData.id }, process.env.JWT_SECRET, {
        expiresIn: Math.floor(Date.now() / 1000) + (60 * 60)
    });
    return token
}

module.exports.utils = {
    generateAuthToken
}