'use strict';

var Router = require('koa-router');
var HttpStatus = require('http-status-codes');
var errors = require('../../../constants.js').errors;
var User = require('../../../models/user');
var Poll = require('../../../models/poll');

var router = new Router();

router.post('/polls', function* () {
  var username = this.req.user.username
  var user = yield User.findOne({ username: username }).exec();
  var question = this.request.body.question;
  var answers = this.request.body.answers;
  var poll = new Poll({
    question: question,
    owner: user,
    answers: answers.map(function(answer) {
      return { answer: answer, votes: []}
    })
  });
  yield poll.save();
  this.body = {};
});

router.patch('/polls/:id', function* () {
  var poll;
  var userId = this.req.user._id;
  var username = this.req.user.username
  var user = yield User.findOne({ username: username }).exec();
  var question = this.request.body.question;
  var answers = this.request.body.answers;

  try {
    poll = yield Poll.findById(this.params.id).exec();
    if (poll === null) {
      throw new Error();
    }
  } catch (e) {
    this.response.status = HttpStatus.BAD_REQUEST;
    this.body = { error: errors['INVALID_POLL_ID'] };
    return;
  }

  if (!poll.owner.equals(userId)) {
    this.response.status = HttpStatus.BAD_REQUEST;
    this.body = { error: errors['USER_DOES_NOT_OWN_POLL'] };
    return;
  }

  yield poll.update({
    question: question,
    owner: user,
    answers: answers.map(function(answer) {
      return { answer: answer, votes: []}
    })
  });
  this.body = {};
});

router.delete('/polls/:id', function* () {
  var poll;
  var userId = this.req.user._id;

  try {
    poll = yield Poll.findById(this.params.id).exec();
    if (poll === null) {
      throw new Error();
    }
  } catch (e) {
    this.response.status = HttpStatus.BAD_REQUEST;
    this.body = { error: errors['INVALID_POLL_ID'] };
    return;
  }

  if (!poll.owner.equals(userId)) {
    this.response.status = HttpStatus.BAD_REQUEST;
    this.body = { error: errors['USER_DOES_NOT_OWN_POLL'] };
    return;
  }

  yield poll.remove();
  this.body = {};
});

module.exports = router;
