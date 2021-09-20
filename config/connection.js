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
// const development = {
//   database: 'dal1chp6l0krci',
//   username: 'niwlzaixfyqhxh',
//   password: '02e838c87686125ef060f92d39dc70032941a5d985ad59475b2101ddfcb44bc3',
//   host: 'ec2-18-209-143-227.compute-1.amazonaws.com',
//   dialect: 'postgres',
//   port:5432,
//   pool: pool_config,
// };

const production = {
  database: 'dal1chp6l0krci',
  username: 'niwlzaixfyqhxh',
  password: '02e838c87686125ef060f92d39dc70032941a5d985ad59475b2101ddfcb44bc3',
  host: 'ec2-18-209-143-227.compute-1.amazonaws.com',
  dialect: 'postgres',
  port:5432,
  ssl: true,
  pool: pool_config,
};

const testing = {
  database: 'dal1chp6l0krci',
  username: 'niwlzaixfyqhxh',
  password: '02e838c87686125ef060f92d39dc70032941a5d985ad59475b2101ddfcb44bc3',
  host: 'ec2-18-209-143-227.compute-1.amazonaws.com',
  dialect: 'postgres',
  port:5432,
  ssl: true,
  pool: pool_config,
};


module.exports = {
  development,
  production,
  testing
};
