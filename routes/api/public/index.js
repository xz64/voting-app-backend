'use strict';

var Router = require('koa-router');
var passport = require('koa-passport');

var router = new Router();

router.use(passport.authenticate(['jwt', 'anonymous'], { session: false }));

var register = require('./register');
router.use('', register.routes(), register.allowedMethods());

var login = require('./login');
router.use('', login.routes(), login.allowedMethods());

var logout = require('./logout');
router.use('', logout.routes(), logout.allowedMethods());

var polls = require('./polls');
router.use('', polls.routes(), polls.allowedMethods());

module.exports = router;
