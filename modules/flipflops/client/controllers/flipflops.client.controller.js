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
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.flipflop = flipflop;
    vm.flipflop.topic = {};
    vm.flipflop.topic.statement = 'This is an awesome app!';
    vm.changeTopic = changeTopic;

    // flip flop recording
    vm.doVideo = doVideo;
    vm.createFlipFlopDBItem = createFlipFlopDBItem;
    vm.startRecording = startRecording;
    vm.stopRecording = stopRecording;
    vm.recording = false;
    vm.doneRecording = doneRecording;
    vm.disable_rec_pro = vm.disable_rec_con = false;
    vm.disable_stp_pro = vm.disable_stp_con = true;

    // flip flop judging
    vm.doJudge = doJudge;

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

    function doVideo(pro_or_con) {
      vm.flipflop.trueview = pro_or_con;
      vm.recording = true;
    }

    function doJudge() {
      var date = new Date();
      vm.flipflop.seen = date.toISOString();
      vm.flipflop.$update(function(response) {
        $state.go('home');
      }, function(err) {
        console.log('failed to update');
      });
    }

    function changeTopic() {
      vm.flipflop.topic = {};
      vm.flipflop.topic.statement = 'Okay, let\'s try another one!';
    }

    function doneRecording() {
      $rootScope.$broadcast('post-files', {});
      $state.go('home');
    }
    // Remove existing Flipflop
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.flipflop.$remove($state.go('flipflops.list'));
      }
    }

    function createFlipFlopDBItem(data) {
      vm.flipflop.links = data;
      vm.flipflop.topic = {};
      save();
    }

    // Save Flipflop
    function save() {
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
