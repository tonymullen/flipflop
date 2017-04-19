// Flipflops service used to communicate Flipflops REST endpoints
(function () {
  'use strict';

  angular
    .module('flipflops')
    .factory('FlipflopsService', FlipflopsService)
    .factory('JudgeFlipflopsService', JudgeFlipflopsService);

  FlipflopsService.$inject = ['$resource'];

  function FlipflopsService($resource) {
    return $resource('/api/flipflops/:judge:flipflopId', {
      flipflopId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }

  JudgeFlipflopsService.$inject = ['$resource'];
  function JudgeFlipflopsService($resource) {
    return $resource('/api/judge', {
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
