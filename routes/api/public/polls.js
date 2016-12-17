'use strict';

var Router = require('koa-router');
var passport = require('koa-passport');
var HttpStatus = require('http-status-codes');
var errors = require('../../../constants.js').errors;
var User = require('../../../models/user');
var Poll = require('../../../models/poll');

var router = new Router();

function pollMap(poll) {
  return {
    id: poll._id,
    question: poll.question,
    owner: poll.owner,
    answers: poll.answers.map(function(answer) {
      return {
        id: answer._id,
        text: answer.answer,
        voteCount: answer.votes.length
      };
    })
  };
}

router.get('/polls', function* () {
  var mineOnly = this.request.query.mine === "true";
  var searchOptions = {};
  var polls;

  if (!this.req.user && mineOnly) {
    this.body = { error: errors['NOT_LOGGED_IN'] };
    return;
  }

  if (mineOnly) {
    searchOptions = { owner: this.req.user._id };
  }

  polls = yield Poll.find(searchOptions).exec();

  this.body = polls.map(pollMap);
});

router.get('/polls/:id', function* () {
  var poll;

  try {
    poll = yield Poll.findById(this.params.id).exec();
  } catch (e) {
    this.response.status = HttpStatus.BAD_REQUEST;
    this.body = {};
    return;
  }

  this.body = pollMap(poll);
});

router.post('/polls/:id/vote/:optionId', function* () {
  var voterId;
  var user = this.req.user;
  var poll;
  var answer;
  var votes;
  var alreadyVoted = false;
  var i, j;

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

  if (user) {
    voterId = user._id.toString();
  } else {
    voterId = (this.request.headers['X-Forwarded-For'] || this.request.ip);
  }

  for (i = 0; i < poll.answers.length; i++) {
    for (j = 0; j < poll.answers[i].votes.length; j++) {
      if (poll.answers[i].votes[j].voter === voterId) {
        alreadyVoted = true;
      }
    }
  }

  if (alreadyVoted) {
    this.response.status = HttpStatus.BAD_REQUEST;
    this.body = { error: errors['ALREADY_VOTED'] };
    return;
  }

  answer = poll.answers.filter(function(answer) {
    return answer._id.equals(this.params.optionId);
  }, this);

  if (answer.length !== 1) {
    this.response.status = HttpStatus.BAD_REQUEST;
    this.body = { error: errors['INVALID_ANSWER_ID'] };
    return;
  }

  answer = answer[0];

  answer.votes.push({ voter: voterId });

  yield poll.save();
  this.body = {};
});

module.exports = router;
