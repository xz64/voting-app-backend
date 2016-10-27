'use strict';

var Router = require('koa-router');

var router = new Router();

router.get('/whoami', function* () {
  this.body = {
    username: this.req.user.username
  };
});

module.exports = router;
