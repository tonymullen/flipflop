'use strict';

/**
 * Module dependencies
 */
var flipflopsPolicy = require('../policies/flipflops.server.policy'),
  flipflops = require('../controllers/flipflops.server.controller');

module.exports = function(app) {
  // Flipflops Routes
  app.route('/api/flipflops').all(flipflopsPolicy.isAllowed)
    .get(flipflops.list)
    .post(flipflops.create);

  app.route('/api/flipflops/:flipflopId').all(flipflopsPolicy.isAllowed)
    .get(flipflops.read)
    .put(flipflops.update)
    .delete(flipflops.delete);

  app.route('/api/topic').all(flipflopsPolicy.isAllowed)
    .get(flipflops.fetchTopic);

  app.route('/api/topic/:topicId').all(flipflopsPolicy.isAllowed)
    .put(flipflops.updateTopic);

  app.route('/api/upload').all(flipflopsPolicy.isAllowed)
    .post(flipflops.upload);

  app.route('/api/judge').all(flipflopsPolicy.isAllowed)
    .get(flipflops.judge);

  app.route('/api/judge/:flipflopId').all(flipflopsPolicy.isAllowed)
    .put(flipflops.update);

  // Finish by binding the Flipflop middleware
  app.param('flipflopId', flipflops.flipflopByID);
  app.param('topicId', flipflops.topicByID);
};
