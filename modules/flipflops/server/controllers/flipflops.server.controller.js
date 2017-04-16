'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Flipflop = mongoose.model('Flipflop'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  fs = require('fs'),
  sys = require('sys'),
  exec = require('child_process').exec;

/**
 * Create a Flipflop
 */
exports.create = function(req, res) {
  var flipflop = new Flipflop(req.body);
  flipflop.user = req.user;

  flipflop.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(flipflop);
    }
  });
};

exports.upload = function(req, res) {
  console.log('upload req:');
  console.log(req.body);

  // res.status(200).send({
  //  message: 'Upload received'
  // });
};

/**
 * Show the current Flipflop
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var flipflop = req.flipflop ? req.flipflop.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  flipflop.isCurrentUserOwner = req.user && flipflop.user && flipflop.user._id.toString() === req.user._id.toString();

  res.jsonp(flipflop);
};

/**
 * Update a Flipflop
 */
exports.update = function(req, res) {
  var flipflop = req.flipflop;

  flipflop = _.extend(flipflop, req.body);

  flipflop.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(flipflop);
    }
  });
};

/**
 * Delete an Flipflop
 */
exports.delete = function(req, res) {
  var flipflop = req.flipflop;

  flipflop.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(flipflop);
    }
  });
};

/**
 * List of Flipflops
 */
exports.list = function(req, res) {
  Flipflop.find().sort('-created').populate('user', 'displayName').exec(function(err, flipflops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(flipflops);
    }
  });
};

/**
 * Flipflop middleware
 */
exports.flipflopByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Flipflop is invalid'
    });
  }

  Flipflop.findById(id).populate('user', 'displayName').exec(function (err, flipflop) {
    if (err) {
      return next(err);
    } else if (!flipflop) {
      return res.status(404).send({
        message: 'No Flipflop with that identifier has been found'
      });
    }
    req.flipflop = flipflop;
    next();
  });
};
