// Flipflops service used to communicate Flipflops REST endpoints
(function () {
  'use strict';

  angular
    .module('flipflops')
    .factory('FlipflopsService', FlipflopsService)
    .factory('JudgeFlipflopsService', JudgeFlipflopsService);

  FlipflopsService.$inject = ['$resource'];

  function FlipflopsService($resource) {
    return $resource('/api/flipflops/:flipflopId', {
      flipflopId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }

  // This is its own service because it retrieves a
  // flipflop at the /api/judge url (based on seen value)
  // but saves it at /api/judge/:flipflopId. We don't know
  // the id at the time of retrieval.
  JudgeFlipflopsService.$inject = ['$resource'];
  function JudgeFlipflopsService($resource) {
    return $resource('/api/judge/:flipflopId', {
      flipflopId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
