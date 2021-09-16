const jwt = require('jsonwebtoken');

const secret = 'secret'//process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : 'secret';

module.exports = {
  issue: (payload) => jwt.sign(payload, secret, { expiresIn: 1080000000 }),
  verify: (token, cb) => jwt.verify(token, secret, {}, cb),
};
