const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const { email, fullname } = user;

    return jwt.sign({ email, fullname }, "$%&*()@password$%()");
}

module.exports = generateToken;
