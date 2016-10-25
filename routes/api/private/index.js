'use strict';

var passport = require('koa-passport');
var Router = require('koa-router');

var User = require('../../../models/user');

var router = new Router();

router.use(passport.authenticate('jwt', { session: false }));

// give new token on each request to private endpoint
router.use(function* (next) {
  var token = yield User.getAuthToken(this.req.user.username);
  this.cookies.set('authToken', token);
  yield next;
});

var privateRoute = require('./privateRoute');
router.use('', privateRoute.routes(), privateRoute.allowedMethods());

module.exports = router;
