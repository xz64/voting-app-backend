'use strict';

require('es6-promise').polyfill();

var app = require('./app');
var db = require('./db');
var logger = require('./logger');

db.open().then(app.start);

function shutdown() {
  logger.info('shutting down');
  db.close();
  process.exit();
}

process.on('SIGTERM', shutdown);

process.on('SIGINT', shutdown);
