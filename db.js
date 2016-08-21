'use strict';

var mongoose = require('mongoose');

mongoose.Promise = Promise;

var logger = require('./logger');
var mongoURI = require('./config').get('database.mongoURI');

mongoose.connect(mongoURI);

var db = mongoose.connection;

db.on('error', logger.error.bind(logger, 'connection error'));

module.exports = {
  open: function() {
    return new Promise(function(resolve) {
      db.once('open', resolve);
    });
  },
  close: function() {
    mongoose.connection.close();
  }
};
