'use strict';

var koa = require('koa');
var bodyParser = require('koa-bodyparser');

var port = require('./config').get('server.port');
var api = require('./routes/api/index');

var app = koa();

app.use(bodyParser());

app.use(api.routes());

module.exports = {
  start: app.listen.bind(app, port)
};
