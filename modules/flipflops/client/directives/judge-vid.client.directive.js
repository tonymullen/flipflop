/* global RecordRTC WhammyRecorder StereoAudioRecorder startRecording */
/* eslint new-cap: 0 */
/* eslint no-alert: 0 */

(function () {
  'use strict';

  angular
    .module('flipflops')
    .directive('judgeVid', judgeVidDirective);

  judgeVidDirective.$inject = ['$http'];

  function judgeVidDirective($http) {
    console.log('hi there!');
    return {
      restrict: 'E',
      bindController: true,
      templateUrl: '/modules/flipflops/client/views/judge-vid.template.html',
      link: function(scope, element, attributes, controller) {
        var videoElements = {};
        videoElements.pro = document.querySelector('#provid');
        videoElements.con = document.querySelector('#convid');
        // var videoProElement = document.querySelector('#provid');
        // var videoConElement = document.querySelector('#convid');
        var progressBar = document.querySelector('#progress-bar');
        var percentage = document.querySelector('#percentage');
        var currentBrowser = !!navigator.mozGetUserMedia ? 'gecko' : 'chromium';
        var fileName;
        var mediaStream = null;

        scope.$on('play-start-pro', function(event, data) {
          startPlay('pro');
          videoElements.pro.addEventListener('ended', function() {
            console.log('pro video ended');
          }, false);
        });

        scope.$on('play-start-con', function(event, data) {
          startPlay('con');
        });

        scope.$on('play-stop-pro', function(event, data) {
          stopPlay('pro');
        });

        scope.$on('play-stop-con', function(event, data) {
          stopPlay('con');
        });

        scope.$on('post-judgement', function(event, data) {
          postJudgement();
        });

        function postJudgement() {
          /*
          $http({
            method: 'POST',
            url: '/api/upload',
            data: JSON.stringify(data)
          }).then(function successCallback(response) {

          }, function errorCallback(response) {
            // console.log('failed to upload judgement properly');
          });
          */
        }

        function onStopPlay() {

        }

        function startPlay(pro_con) {
          // videoElements[pro_con].src = window.URL.createObjectURL(stream);
          videoElements[pro_con].play();
          // videoElements[pro_con].muted = true;
          // videoElements[pro_con].controls = false;
        }

        function stopPlay(pro_con) {
          videoElements[pro_con].stop();
        }

      }
    };
  }
}());
