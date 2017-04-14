(function () {
  'use strict';

  angular
    .module('flipflops')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('flipflops', {
        abstract: true,
        url: '/flipflops',
        template: '<ui-view/>'
      })
      .state('flipflops.list', {
        url: '',
        templateUrl: '/modules/flipflops/client/views/list-flipflops.client.view.html',
        controller: 'FlipflopsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Flipflops List'
        }
      })
      .state('flipflops.record', {
        url: '/record',
        templateUrl: '/modules/flipflops/client/views/record-flipflop.client.view.html',
        controller: 'FlipflopsController',
        controllerAs: 'vm',
        resolve: {
          flipflopResolve: newFlipflop
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Flipflops Create'
        }
      })
      .state('flipflops.edit', {
        url: '/:flipflopId/edit',
        templateUrl: '/modules/flipflops/client/views/form-flipflop.client.view.html',
        controller: 'FlipflopsController',
        controllerAs: 'vm',
        resolve: {
          flipflopResolve: getFlipflop
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Flipflop {{ flipflopResolve.name }}'
        }
      })
      .state('flipflops.view', {
        url: '/:flipflopId',
        templateUrl: '/modules/flipflops/client/views/view-flipflop.client.view.html',
        controller: 'FlipflopsController',
        controllerAs: 'vm',
        resolve: {
          flipflopResolve: getFlipflop
        },
        data: {
          pageTitle: 'Flipflop {{ flipflopResolve.name }}'
        }
      });
  }

  getFlipflop.$inject = ['$stateParams', 'FlipflopsService'];

  function getFlipflop($stateParams, FlipflopsService) {
    return FlipflopsService.get({
      flipflopId: $stateParams.flipflopId
    }).$promise;
  }

  newFlipflop.$inject = ['FlipflopsService'];

  function newFlipflop(FlipflopsService) {
    return new FlipflopsService();
  }
}());
