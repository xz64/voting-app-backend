var passport = require('koa-passport');
var JwtStrategy = require('passport-jwt').Strategy;
var AnonymousStrategy = require('passport-anonymous').Strategy;

var User = require('./models/user');
var JWT_SECRET = require('./config').get('auth.secret');

module.exports = [
  new JwtStrategy({
    secretOrKey: JWT_SECRET,
    jwtFromRequest: function(req) {
      return req.cookies.get('authToken') || null;
    }
  },
  function(token, done) {
    User.findOne({ username: token.sub })
    .then(function(user) {
      return done(null, user);
    })
    .catch(function() {
      return done(null, false);
    })
  }),
  new AnonymousStrategy()
]
