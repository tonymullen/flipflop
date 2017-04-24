(function () {
  'use strict';


  // Flipflops controller
  angular
    .module('flipflops')
    .controller('FlipflopsController', FlipflopsController);

  FlipflopsController.$inject = ['$rootScope', '$scope', '$state', '$window', '$timeout', 'Authentication', 'flipflopResolve', 'topicResolve'];

  function FlipflopsController ($rootScope, $scope, $state, $window, $timeout, Authentication, flipflop, topic) {
    var vm = this;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.flipflop = flipflop;
    vm.topic = topic || vm.flipflop.topic;
    vm.changeTopic = changeTopic;

    // flip flop recording
    vm.doVideo = doVideo;
    vm.createFlipFlopDBItem = createFlipFlopDBItem;
    vm.startRecording = startRecording;
    vm.stopRecording = stopRecording;
    vm.recordView = false;
    vm.recording = { pro: false, con: false };
    vm.doneRecording = doneRecording;
    vm.disable_rec_pro = vm.disable_rec_con = false;
    vm.disable_stp_pro = vm.disable_stp_con = true;
    vm.startPlay = startPlay;
    vm.stopPlay = stopPlay;

    // flip flop judging
    vm.doJudge = doJudge;
    vm.pro = { selected: false };
    vm.con = { selected: false };
    vm.playing = false;
    vm.select = select;

    function startRecording(pro_con) {
      vm.disable_rec_pro = vm.disable_rec_con = true;
      if (pro_con === 'pro') {
        vm.disable_stp_pro = false;
        vm.disable_stp_con = true;
      } else if (pro_con === 'con') {
        vm.disable_stp_pro = true;
        vm.disable_stp_con = false;
      }
      vm.recording[pro_con] = true;
      $rootScope.$broadcast('rec-start-' + pro_con, {});
    }

    function stopRecording(pro_con) {
      $rootScope.$broadcast('rec-stop-' + pro_con, {});
      vm.recording[pro_con] = false;
      vm.disable_rec_pro = vm.disable_rec_con = false;
      vm.disable_stp_pro = vm.disable_stp_con = true;
    }

    function doVideo(pro_or_con) {
      vm.flipflop.trueview = pro_or_con;
      vm.recordView = true;
    }

    function startPlay(pro_con) {
      // vm.disable_play_pro = vm.disable_play_con = true;
      $rootScope.$broadcast('play-start-' + pro_con, {});
    }

    function stopPlay(pro_con) {
      $rootScope.$broadcast('play-stop-' + pro_con, {});
      // vm.disable_play_pro = vm.disable_play_con = false;
      // vm.disable_stp_pro = vm.disable_stp_con = true;
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
    
    function select(pro_or_con) {
      vm.pro.selected = pro_or_con === 'pro';
      vm.con.selected = pro_or_con === 'con';
    }

    function changeTopic() {
    //  vm.flipflop.topic = {};
    //  vm.flipflop.topic.statement = 'Okay, let\'s try another one!';
    }

    function doneRecording() {
      $rootScope.$broadcast('post-files', {});
      var date = new Date();
      vm.topic.seen = date.toISOString();
      vm.topic.$update(function(response) {
        $state.go('home');
      }, function(err) {
        console.log('failed to update topic');
      });
    }
    // Remove existing Flipflop
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.flipflop.$remove($state.go('flipflops.list'));
      }
    }

    function createFlipFlopDBItem(data) {
      vm.flipflop.links = data;
      vm.flipflop.topic = vm.topic;
      console.log(vm.flipflop.topic);
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
