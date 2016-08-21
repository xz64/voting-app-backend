'use strict';

var Router = require('koa-router');
var recaptchaValidator = require('recaptcha-validator');

var recaptchaSecretKey = require('../../config').get('recaptcha.secretKey');
var User = require('../../models/user');

var router = new Router();

router.post('/register', function* () {
  var body = this.request.body;
  yield recaptchaValidator.promise(recaptchaSecretKey, body.captcharesponse,
    true);
  var user = new User({
    email: body.email,
    password: body.password
  });
  yield user.save();
  this.body = {};
});

module.exports = router;
