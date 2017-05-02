(function () {
  'use strict';


  // Flipflops controller
  angular
    .module('flipflops')
    .controller('FlipflopsController', FlipflopsController);

  FlipflopsController.$inject = ['$rootScope', '$scope', '$state', '$window', '$timeout',
    'Authentication', 'flipflopResolve', 'topicResolve', 'UsersService'];

  function FlipflopsController ($rootScope, $scope, $state, $window, $timeout,
    Authentication, flipflop, topic, UsersService) {
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
    var light = 127;
    var dark = 127;
    vm.doJudge = doJudge;
    vm.pro = { selected: false, playing: false };
    vm.con = { selected: false, playing: false };
    vm.select = select;
    vm.selectionMade = false;
    $scope.slider = {
      options: {
        floor: 0,
        ceil: 10,
        step: 1,
        noSwitching: true,
        getPointerColor: function(value) {
          if (value <= 0)
            return '#ffffff';
          if (value <= 1)
            return '#DFDFDF';
          if (value <= 2)
            return '#BEBEBE';
          if (value <= 3)
            return '#9F9F9F';
          if (value <= 4)
            return '#808080';
          if (value <= 5)
            return '#808080';
          if (value <= 6)
            return '#808080';
          if (value <= 7)
            return '#606060';
          if (value <= 8)
            return '#404040';
          if (value <= 9)
            return '#202020';
          if (value <= 10)
            return '#000000';
        },
        onChange: function(sliderId, modelValue, highValue, pointerType) {
          if (pointerType === 'min') {
            $scope.slider.max = 10 - $scope.slider.min;
          } else {
            $scope.slider.min = 10 - $scope.slider.max;
          }
          dark = Math.ceil($scope.slider.min * (127 / 4));
          light = 255 - dark;
          angular.element(document.querySelector('.rz-bar.rz-selection'))
            .css('background', '-webkit-linear-gradient(left, rgb(' + light + ',' + light + ',' + light + '), rgb(' + dark + ',' + dark + ',' + dark + '))');
          angular.element(document.querySelector('.rzslider .rz-pointer:after'))
            .css('background', 'green');
        }
      }
    };
    $scope.slider.min = 3;
    $scope.slider.max = 10 - $scope.slider.min;


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

    function startPlay(pro_or_con) {
      $rootScope.$broadcast('play-start-' + pro_or_con, {});
      vm[pro_or_con].playing = true;
    }

    function stopPlay(pro_or_con) {
      $rootScope.$broadcast('play-stop-' + pro_or_con, {});
      vm[pro_or_con].playing = false;
    }

    function doJudge() {
      var date = new Date();
      vm.flipflop.seen = date.toISOString();
      var bias = vm.pro.selected ? 1 : -1;
      var newbias = vm.flipflop.bias * vm.flipflop.evals;
      vm.flipflop.evals++;
      vm.flipflop.bias = (newbias + bias) / vm.flipflop.evals;
      vm.flipflop.$update(function(response) {
        $state.go('home');
      }, function(err) {
        console.log('failed to update');
      });

      var user = new UsersService(Authentication.user);
      console.log(user);
      user.judgedFlipflops.push(vm.flipflop);
      user.$update();
    }

    function select(pro_or_con) {
      vm.pro.selected = pro_or_con === 'pro';
      vm.con.selected = pro_or_con === 'con';
      vm.selectionMade = true;
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
        $state.go('home');
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
