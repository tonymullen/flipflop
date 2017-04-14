(function () {
  'use strict';

  angular
    .module('flipflops')
    .controller('FlipflopsListController', FlipflopsListController);

  FlipflopsListController.$inject = ['FlipflopsService'];

  function FlipflopsListController(FlipflopsService) {
    var vm = this;

    vm.flipflops = FlipflopsService.query();
  }
}());
