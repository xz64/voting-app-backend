'use strict';

var Router = require('koa-router');

var router = new Router();

router.get('/test', function* () {
  this.body = {};
});

module.exports = router;
