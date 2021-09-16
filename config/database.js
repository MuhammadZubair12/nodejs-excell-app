const Sequelize = require('sequelize');
const path = require('path');

const connection = require('./connection');

let database;

switch (process.env.NODE_ENV) {
  case 'production':
    database = new Sequelize(
      connection.production.database,
      connection.production.username,
      connection.production.password, {
        host: connection.production.host,
        dialect: connection.production.dialect,
        port:connection.production.port,
        pool: {
          max: 5,
          min: 0,
          idle: 20000,
          acquire: 20000
        },
      });
    break;
  case 'testing':
    database = new Sequelize(
      connection.testing.database,
      connection.testing.username,
      connection.testing.password, {
        host: connection.testing.host,
        dialect: connection.testing.dialect,
        port:connection.production.port,
        pool: {
          max: 5,
          min: 0,
          idle: 20000,
          acquire: 20000
        },
      });
    break;
    case 'development':
    database = new Sequelize(
      connection.development.database,
      connection.development.username,
      connection.development.password, {
        host: connection.development.host,
        dialect: connection.development.dialect,
        port:connection.development.port,
        pool: {
          max: 5,
          min: 0,
          idle: 20000,
          acquire: 20000
        },
      });
    break;
  default:
  database = new Sequelize(
    connection.production.database,
    connection.production.username,
    connection.production.password, {
      host: connection.production.host,
      dialect: connection.production.dialect,
      port:connection.production.port,
      pool: {
        max: 5,
        min: 0,
        idle: 20000,
        acquire: 20000
      },
    });
}

module.exports = database;
