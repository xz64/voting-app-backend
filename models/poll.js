var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pollSchema = new Schema({
  question: String,
  owner: { type: Schema.ObjectId, ref: 'User' },
  answers: [{
    answer: String,
    votes: [{
      voter: String
    }]
  }]
});

var pollModel = mongoose.model('Poll', pollSchema);

module.exports = pollModel;
