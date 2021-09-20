/**
 * third party libraries
 */
require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const mapRoutes = require('express-routes-mapper');
const cors = require('cors');
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');

/**
 * server configuration
 */
const config = require('../config/');
const models = require('./models');
const auth = require('./policies/auth.policy');
const foo = process.env.FOO;
// environment: development, staging, testing, production
if (!process.env.NODE_ENV) process.env.NODE_ENV = "development"
const environment = process.env.NODE_ENV;
/**
 * express application
 */
const app = express();
const server = http.Server(app);
const mappedOpenRoutes = mapRoutes(config.publicRoutes, 'api/controllers/');
const mappedAuthRoutes = mapRoutes(config.privateRoutes, 'api/controllers/');
// var pg = require('pg');
// pg.defaults.ssl = true;
models.sequelize.sync().then(() => {
  console.log('Database looks fine');
}).catch((err) => {
  console.log('Error occurred while syncing db.', err);
})//const DB = dbService(environment, config.migrate).start()
// const DB = dbService(environment, false).start();
const User = require('./models/User');

// allow cross origin requests
// configure to only allow requests from certain origins
const corsOpts = {
  origin: '*',

  methods: [
    'GET',
    'POST',
  ],

  allowedHeaders: [
    'Content-Type',
  ],
};

app.use(cors(corsOpts));
app.use(fileUpload(
  {
    safeFileNames: true,
    preserveExtension: true,
    safeFileNames: true,
  }
));
app.use(expressValidator({
  customValidators: {
    isEmailAvailable(email) {
      return new Promise((resolve, reject) => {
        models.user.findOne({ where: { email: email } }).then((err, user) => {
          if (err) reject();
          if (user == null) {
            resolve();
          } else {
            reject();
          }
        })
      });
    }
  }
}));
// secure your private routes with jwt authentication middleware
app.all('/private/api/v1/*', (req, res, next) => auth(req, res, next));

// secure express app
app.use(helmet({
  dnsPrefetchControl: false,
  frameguard: false,
  ieNoOpen: false,
}));

// parsing the request bodys
app.use(bodyParser.urlencoded({limit: '10mb', extended: false }));
app.use(bodyParser.json({limit: '10mb', extended: true}));


// fill routes for express appliction
app.use('/public/api/v1', mappedOpenRoutes);
app.use('/private/api/v1', mappedAuthRoutes);
server.listen(config.port, () => {
  if (environment !== 'production' &&
    environment !== 'development' &&
    environment !== 'testing'
  ) {
    console.error(`NODE_ENV is set to ${environment}, but only production and development are valid.`);
  }
//  process.exit(1);
  return models;
});

