var keyMirror = require('keymirror');

var errors = keyMirror({
  'ALREADY_VOTED': null,
  'INVALID_POLL_ID': null,
  'INVALID_ANSWER_ID': null,
  'USER_DOES_NOT_OWN_POLL': null,
  'NOT_LOGGED_IN': null
});

module.exports = {
  errors: errors
};
