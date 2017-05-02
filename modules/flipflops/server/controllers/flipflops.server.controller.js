'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Flipflop = mongoose.model('Flipflop'),
  Topic = mongoose.model('Topic'),
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
  var message = {
    'pro': {},
    'con': {}
  };
  ['pro', 'con'].forEach(pc => {
    _upload(req.body[pc].audio);
    if (req.body[pc].uploadOnlyAudio) {
      message[pc].onlyAudio = true;
      message[pc].link = req.body[pc].audio.name.split('.')[0];
    }
    if (!req.body[pc].uploadOnlyAudio) {
      _upload(req.body[pc].video);
      merge(res, req.body[pc]);
      message[pc].onlyAudio = false;
      message[pc].link = req.body[pc].video.name.split('.')[0];
    }
  });
  res.jsonp(message);
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
 * Topic middleware
 */
exports.topicByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Topic is invalid'
    });
  }
  Topic.findById(id).exec(function (err, topic) {
    if (err) {
      return next(err);
    } else if (!topic) {
      return res.status(404).send({
        message: 'No Topic with that identifier has been found'
      });
    }
    req.topic = topic;
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
  console.log(flipflop);

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
 * Update a Flipflop
 */
exports.updateTopic = function(req, res) {
  var topic = req.topic;
  topic = _.extend(topic, req.body);
  console.log(topic);

  topic.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      console.log('updated topic');
      res.jsonp(topic);
    }
  });
};

/**
 * judge
 */
exports.judge = function(req, res) {
  console.log(req.user._id);
  Flipflop.findOne({ user: { $ne: req.user._id } }, {}, { sort: { 'seen': 1 } })
    .populate('user', 'displayName')
      .exec(function (err, flipflop) {
        if (err) {
          console.log(err);
        } else if (!flipflop) {
          return res.status(404).send({
            message: 'No Flipflop with that identifier has been found'
          });
        }
        res.jsonp(flipflop);
      });
};

/**
 * fetch topipc by seen value
 */
exports.fetchTopic = function(req, res) {
  Topic.findOne({}, {}, { sort: { 'seen': 1 } })
      .exec(function (err, topic) {
        if (err) {
          console.log(err);
        } else if (!topic) {
          return res.status(404).send({
            message: 'No Topic with that identifier has been found'
          });
        }
        res.jsonp(topic);
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

function _upload(file) {
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

function merge(res, files) {
  // its probably *nix, assume ffmpeg is available
  var audioFile = config.upload_dir + '/' + files.audio.name;
  var videoFile = config.upload_dir + '/' + files.video.name;
  var mergedFile = config.upload_dir + '/' + files.audio.name.split('.')[0] + '-merged.webm';

  var util = require('util'),
    exec = require('child_process').exec;

  var command = 'ffmpeg -i ' + audioFile + ' -i ' + videoFile + ' -map 0:0 -map 1:0 ' + mergedFile;

  exec(command, function (error, stdout, stderr) {
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);

    if (error) {
      console.log('exec error: ' + error);
    } else {
      // response.statusCode = 200;
      // response.writeHead(200, {
      //   'Content-Type': 'application/json'
      // });
      // res.jsonp(files.audio.name.split('.')[0] + '-merged.webm');

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
