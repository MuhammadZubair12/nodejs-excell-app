let pool_config = {
  max: 5,
  min: 0,
  idle: 10000,
  acquire: 10000,
  handleDisconnects: true,
  evict: 60000,
  connectRetries: 5,
  operatorsAliases: false,
  autoreconnect: true,
}
const development = {
  database: 'countifier',
  username: 'postgres',
  password: 'c00822631',
  host: 'localhost',
  dialect: 'postgres',
  port:5432,
  pool: pool_config,
};

const production = {
  database: 'heroku_8d0dcc4de6842ba',
  username: 'b12992ed7073bc',
  password: '6678e912',
  host: 'us-cdbr-iron-east-01.cleardb.net',
  dialect: 'mysql',
  port:3306,
  pool: pool_config,
};

module.exports = {
  development,
  production,
};
