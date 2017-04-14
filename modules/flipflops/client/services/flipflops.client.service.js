// Flipflops service used to communicate Flipflops REST endpoints
(function () {
  'use strict';

  angular
    .module('flipflops')
    .factory('FlipflopsService', FlipflopsService);

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
}());
