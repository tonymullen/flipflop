'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  config = require(path.resolve('./config/config'));

/**
 * Flipflops module init function.
 */
module.exports = function (app, db) {
  module.exports.upload_dir = './public/uploads';
  module.exports.s3 = {
    key: '',
    secret: '',
    bucket: ''
  };
  module.exports.s3_enabled = false;
};

