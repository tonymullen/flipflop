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
  config = require('../config/flipflops.server.config.js'),
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
  var message = {};
  ['pro', 'con'].forEach(pc => {
    _upload(res, req.body[pc].audio);
    if (req.body[pc].uploadOnlyAudio) {
      message[pc] = req.body[pc].audio.name;
    }
    if (!req.body[pc].uploadOnlyAudio) {
      _upload(res, req.body[pc].video);
      merge(res, req.body[pc]);
      message[pc] = req.body[pc].video.name;
    }
  });
  res.status(200).send(message);
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


function _upload(response, file) {
  var fileRootName = file.name.split('.').shift(),
    fileExtension = file.name.split('.').pop(),
    filePathBase = config.upload_dir + '/',
    fileRootNameWithBase = filePathBase + fileRootName,
    filePath = fileRootNameWithBase + '.' + fileExtension,
    fileID = 2,
    fileBuffer;

  while (fs.existsSync(filePath)) {
    filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
    fileID += 1;
  }

  file.contents = file.contents.split(',').pop();

  fileBuffer = new Buffer(file.contents, 'base64');
  fs.writeFileSync(filePath, fileBuffer);
}

function merge(response, files) {
  // its probably *nix, assume ffmpeg is available
  var audioFile = './uploads/' + files.audio.name;
  var videoFile = './uploads/' + files.video.name;
  var mergedFile = './uploads/' + files.audio.name.split('.')[0] + '-merged.webm';

  var util = require('util'),
    exec = require('child_process').exec;

  var command = 'ffmpeg -i ' + audioFile + ' -i ' + videoFile + ' -map 0:0 -map 1:0 ' + mergedFile;

  exec(command, function (error, stdout, stderr) {
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);

    if (error) {
      console.log('exec error: ' + error);
      response.statusCode = 404;
      response.end();
    } else {
      response.statusCode = 200;
      response.writeHead(200, {
        'Content-Type': 'application/json'
      });
      response.end(files.audio.name.split('.')[0] + '-merged.webm');

      // removing audio/video files
      unlinkFile(audioFile);
      unlinkFile(videoFile);
    }
  });
}


function unlinkFile(path) {
  try {
    fs.unlink(path);
  } catch (e) {
    // empty
  }
}
