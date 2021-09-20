const Sequelize = require('sequelize');
const path = require('path');

const connection = require('./connection');

let database;


switch (process.env.NODE_ENV) {
  case 'production':
    database = new Sequelize(
      connection.testing.database,
      connection.testing.username,
      connection.testing.password, {
        host: connection.testing.host,
        dialect: connection.testing.dialect,
        operatorsAliases: false,
        port:connection.testing.port,
        dialectOptions: {
          ssl: { rejectUnauthorized: false },
          useUTC: true,
          sslmode: require
        },
        pool: {
          max: 5,
          min: 0,
          idle: 10000,
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
        operatorsAliases: false,
        port:connection.production.port,
        dialectOptions: {
          ssl: { rejectUnauthorized: false },
          useUTC: true,
          sslmode: require
        },
        pool: {
          max: 5,
          min: 0,
          idle: 10000,
          acquire: 20000
        },
      });
    break;
  default:
  database = new Sequelize(
    connection.development.database,
    connection.development.username,
    connection.development.password, {
      host: connection.development.host,
      dialect: connection.development.dialect,
      operatorsAliases: false,
      port:connection.development.port,
      dialectOptions: {
        ssl: { rejectUnauthorized: false },
        useUTC: true,
        sslmode: require
      },
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
        acquire: 20000
      },
    });
}

module.exports = database;
