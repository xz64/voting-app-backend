'use strict';

var Router = require('koa-router');
var HttpStatus = require('http-status-codes');

var router = new Router();

router.post('*', function* (next) {
  if (this.request.headers['x-requested-with'] !== 'XMLHttpRequest') {
    // csrf protection
    this.response.status = HttpStatus.BAD_REQUEST;
    this.body = { error: 'missing CSRF header (X-Requested-With: '
      + 'XMLHttpRequest)' };
    return;
  }
  yield next;
});

var publicRouter = require('./public');
router.use('/api', publicRouter.routes(), publicRouter.allowedMethods());

var privateRouter = require('./private');
router.use('/api', privateRouter.routes(), privateRouter.allowedMethods());

module.exports = router;
