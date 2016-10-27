'use strict';

var Router = require('koa-router');

var router = new Router();

var register = require('./register');
router.use('', register.routes(), register.allowedMethods());

var login = require('./login');
router.use('', login.routes(), login.allowedMethods());

var logout = require('./logout');
router.use('', logout.routes(), logout.allowedMethods());

module.exports = router;
