const privateRoutes = require('./routes/privateRoutes');
const publicRoutes = require('./routes/publicRoutes');

module.exports = {
  keep: false,
  // migrate: false,
  privateRoutes,
  publicRoutes,
  port: process.env.PORT || '3000',
};
