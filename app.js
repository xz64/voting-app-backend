'use strict';

var koa = require('koa');
var bodyParser = require('koa-bodyparser');
var passport = require('koa-passport');

var port = require('./config').get('server.port');
var api = require('./routes/api/index');
var authStrategies = require('./auth');

var app = koa();

app.use(bodyParser());

authStrategies.forEach(function(strategy) {
  passport.use(strategy);
});

app.use(passport.initialize());

app.use(api.routes());

module.exports = {
  start: app.listen.bind(app, port)
};
