'use strict';

var convict = require('convict');

var config = convict({
  env: {
    doc: 'the application environment',
    format: ['production', 'development'],
    default: 'development',
    env: 'NODE_ENV'
  },
  server: {
    port: {
      doc: 'the port to which the server should bind',
      format: 'port',
      default: 8081,
      env: 'PORT'
    }
  },
  database: {
    mongoURI: {
      doc: 'the mongodb:// URI',
      default: 'mongodb://localhost:27017/voting',
      env: 'MONGOLAB_URI'
    }
  },
  recaptcha: {
    secretKey: {
      doc: 'the recaptcha v2 secret key',
      default: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
      env: 'RECAPTCHA_SECRET_KEY'
    }
  }
});

module.exports = config;
