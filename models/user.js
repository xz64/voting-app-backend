// much of the code here was taken from 
// http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt
// and http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt
// and http://devsmash.com/blog/implementing-max-login-attempts-with-mongoose
'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var SALT_WORK_FACTOR = 10;
var MAX_LOGIN_ATTEMPTS = 5;
var LOCK_TIME = 2 * 60 * 60 * 1000;
var JWT_SECRET = require('../config.js').get('auth.secret');

var userSchema = mongoose.Schema({
  username: { type : String, unique: true, index: true, required: true,
    lowercase: true, trim: true },
  password: { type: String, required: true },
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Number }
});

userSchema.virtual('isLocked').get(function() {
  // check for a future lockUntil timestamp
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

var reasons = userSchema.statics.failedLogin = {
  NOT_FOUND: new Error('User or password incorrect'),
  PASSWORD_INCORRECT: new Error('User or password incorrect'),
  MAX_ATTEMPTS: new Error('Account has been locked')
};

userSchema.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.incLoginAttempts = function(cb) {
  // if we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    }, cb);
  }
  // otherwise we're incrementing
  var updates = { $inc: { loginAttempts: 1 } };
  // lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.update(updates, cb);
};

userSchema.statics.getAuthToken = function(username) {
  return new Promise(function(resolve, reject) {
    jwt.sign({sub: username}, JWT_SECRET, { expiresIn: '15m' },
      function(err, token) {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
  });
};

userSchema.statics.login = function(username, password) {
  var self = this;
  var checkPassword = new Promise(function(resolve, reject) {
    self.getAuthenticated(username, password, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return checkPassword.then(function() {
    return self.getAuthToken(username);
  });

};

userSchema.statics.getAuthenticated = function(username, password, cb) {
  this.findOne({ username: username }, function(err, user) {
    if (err) return cb(err);

    // make sure the user exists
    if (!user) {
      return cb(reasons.NOT_FOUND, null, reasons.NOT_FOUND);
    }

    // check if the account is currently locked
    if (user.isLocked) {
      // just increment login attempts if account is already locked
      return user.incLoginAttempts(function(err) {
        if (err) return cb(err);
        return cb(reasons.MAX_ATTEMPTS, null, reasons.MAX_ATTEMPTS);
      });
    }

    // test for a matching password
    user.comparePassword(password, function(err, isMatch) {
      if (err) return cb(err);

      // check if the password was a match
      if (isMatch) {
        // if there's no lock or failed attempts, just return the user
        if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
        // reset attempts and lock info
        var updates = {
          $set: { loginAttempts: 0 },
          $unset: { lockUntil: 1 }
        };
        return user.update(updates, function(err) {
          if (err) return cb(err);
          return cb(null, user);
        });
      }

      // password is incorrect, so increment login attempts before responding
      user.incLoginAttempts(function(err) {
        if (err) return cb(err);
        return cb(reasons.PASSWORD_INCORRECT, null, reasons.PASSWORD_INCORRECT);
      });
    });
  });
};

var userModel = mongoose.model('User', userSchema);

module.exports = userModel;
