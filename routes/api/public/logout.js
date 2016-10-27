'use strict';

var Router = require('koa-router');

var router = new Router();

router.post('/logout', function* () {
  this.cookies.set('authToken', '');
  this.body = {};
});

module.exports = router;
