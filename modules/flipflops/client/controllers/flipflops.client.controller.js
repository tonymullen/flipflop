(function () {
  'use strict';


  // Flipflops controller
  angular
    .module('flipflops')
    .controller('FlipflopsController', FlipflopsController);

  FlipflopsController.$inject = ['$rootScope', '$scope', '$state', '$window', '$timeout', 'Authentication', 'flipflopResolve'];

  function FlipflopsController ($rootScope, $scope, $state, $window, $timeout, Authentication, flipflop) {
    var vm = this;
    vm.authentication = Authentication;
    vm.flipflop = flipflop;
    vm.flipflop.topic = {};
    vm.flipflop.topic.statement = 'This is an awesome app!';
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.doVideo = doVideo;
    vm.changeTopic = changeTopic;
    vm.recording = false;
    vm.done = done;
    vm.startRecording = startRecording;
    vm.stopRecording = stopRecording;
    vm.disable_rec_pro = vm.disable_rec_con = false;
    vm.disable_stp_pro = vm.disable_stp_con = true;

    function startRecording(pro_con) {
      vm.disable_rec_pro = vm.disable_rec_con = true;
      if (pro_con === 'pro') {
        vm.disable_stp_pro = false;
        vm.disable_stp_con = true;
      } else if (pro_con === 'con') {
        vm.disable_stp_pro = true;
        vm.disable_stp_con = false;
      }
      $rootScope.$broadcast('rec-start-' + pro_con, {});
    }

    function stopRecording(pro_con) {
      $rootScope.$broadcast('rec-stop-' + pro_con, {});
      vm.disable_rec_pro = vm.disable_rec_con = false;
      vm.disable_stp_pro = vm.disable_stp_con = true;
    }

    function doVideo(pro) {
      console.log(pro);
      vm.recording = true;
    }

    function changeTopic() {
      vm.flipflop.topic = {};
      vm.flipflop.topic.statement = 'Okay, let\'s try another one!';
    }

    function done() {
      $state.go('home');
    }
    // Remove existing Flipflop
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.flipflop.$remove($state.go('flipflops.list'));
      }
    }


    // Save Flipflop
    function save(isValid) {
      console.log('save the flipflops!');
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.flipflopForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.flipflop._id) {
        vm.flipflop.$update(successCallback, errorCallback);
      } else {
        vm.flipflop.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('flipflops.view', {
          flipflopId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
