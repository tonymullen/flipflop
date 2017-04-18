'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Flipflop Schema
 */
var TopicSchema = new Schema({
  topic: String,
  statement: String,
  pro: {
    type: String,
    enum: ['left', 'right', 'other']
  }
});

var FlipflopSchema = new Schema({
  links: {
    pro: {
      onlyAudio: Boolean,
      link: { type: String, required: true }
    },
    con: {
      onlyAudio: Boolean,
      link: { type: String, required: true }
    }
  },
  trueview: {
    type: String,
    enum: ['pro', 'con']
  },
  strength: { type: Number, 'default': 0 },
  bias: { type: Number, 'default': 0 },
  evals: { type: Number, 'default': 0 },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Topic', TopicSchema);
mongoose.model('Flipflop', FlipflopSchema);
