'use strict';

var Router = require('koa-router');

var router = new Router();

var register = require('./register');
router.use('/api', register.routes(), register.allowedMethods());

module.exports = router;
