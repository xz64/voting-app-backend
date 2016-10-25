'use strict';

var Router = require('koa-router');
var HttpStatus = require('http-status-codes');
var User = require('../../../models/user');

var router = new Router();

router.post('/login', function* () {
  var username = this.request.body.username;
  var password = this.request.body.password;
  if(!username || !password) {
    this.response.status = HttpStatus.BAD_REQUEST;
    this.body = { error: 'username / password field(s) missing' };
    return;
  }
  var token = yield User.login(username, password);
  this.cookies.set('authToken', token);
  this.body = {};
});

module.exports = router;
