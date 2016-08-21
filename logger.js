var bunyan = require('bunyan');

var logger = bunyan.createLogger({name: 'voting-app-backend'});

module.exports = logger;
