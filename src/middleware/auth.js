const User = require('../models/user');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer', '').trim();
        const decode = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findOne({ _id: decode._id, 'tokens.token': token }, { age: 1, name: 1, email: 1, createdAt: 1, updatedAt: 1, password: 1, tokens: 1 });

        if (!user) throw Error();

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports.auth = auth;