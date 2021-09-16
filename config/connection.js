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
  database: 'da1dvo9ivmcgk2',
  username: 'fyherdyowangiq',
  password: '9e3b2ca441fc0dcb00bb400b8651f57dab3507a5119ab007507ed1d6c9a2e892',
  host: 'ec2-34-227-120-94.compute-1.amazonaws.com',
  dialect: 'postgres',
  // port:5432,
  // pool: pool_config,
};

module.exports = {
  development,
  production,
};
