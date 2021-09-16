const Winston = require('winston');

const logger = Winston.createLogger({
    level: 'verbose',
    colorize: true,
    transports: [
      new Winston.transports.Console({
        timestamp: true
      }),
      new Winston.transports.File({
        filename: 'app.log',
        timestamp: true
      })
    ]
});

module.exports = logger;
