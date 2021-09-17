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
  database: 'dcbiu0u9tdlli0',
  username: 'zmaaobflsmsxey',
  password: '8579b7be7f5031acbcaaf52c8779c1c559dff0b6fd822ae14bb8e33b23b5a4c3',
  host: 'ec2-54-236-234-167.compute-1.amazonaws.com',
  dialect: 'postgres',
  port:5432,
  pool: pool_config,
};

const production = {
  database: 'dcbiu0u9tdlli0',
  username: 'zmaaobflsmsxey',
  password: '8579b7be7f5031acbcaaf52c8779c1c559dff0b6fd822ae14bb8e33b23b5a4c3',
  host: 'ec2-54-236-234-167.compute-1.amazonaws.com',
  dialect: 'postgres',
  port:5432,
  pool: pool_config,
};

module.exports = {
  development,
  production,
};
