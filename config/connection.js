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
// const development = {
//   database: 'countifier',
//   username: 'postgres',
//   password: 'c00822631',
//   host: 'localhost',
//   dialect: 'postgres',
//   port:5432,
//   pool: pool_config,
// };
const development = {
  database: 'da1dvo9ivmcgk2',
  username: 'fyherdyowangiq',
  password: '9e3b2ca441fc0dcb00bb400b8651f57dab3507a5119ab007507ed1d6c9a2e892',
  host: 'ec2-34-227-120-94.compute-1.amazonaws.com',
  dialect: 'postgres',
  port:5432,
  pool: pool_config,
};

const production = {
  database: 'd7hu4m62vle4ve',
  username: 'oppywrshksoyxy',
  password: '9382e55bf7e994dd32dc88856f737ba82ab4ec074f96271fe95b0310749c65b7',
  host: 'ec2-54-81-126-150.compute-1.amazonaws.com',
  dialect: 'postgres',
  port:5432,
  pool: pool_config,
};

module.exports = {
  // development,
  production,
};
