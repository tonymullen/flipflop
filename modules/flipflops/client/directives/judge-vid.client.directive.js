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
    return {
      restrict: 'E',
      templateUrl: '/modules/flipflops/client/views/judge-vid.template.html',
      link: function(scope, element, attributes, controller) {
        var videoElements = {};
        videoElements.pro = document.querySelector('#provid');
        videoElements.con = document.querySelector('#convid');
        var progress = {};
        progress.pro = document.querySelector('#proProgress');
        progress.con = document.querySelector('#conProgress');
        var seen = {};
        seen.pro = false;
        seen.con = false;

        var currentBrowser = !!navigator.mozGetUserMedia ? 'gecko' : 'chromium';
        var fileName;
        var mediaStream = null;

        function playVid (pro_or_con) {
          startPlay(pro_or_con);
          var vid = videoElements[pro_or_con];
          var prog = progress[pro_or_con];
          vid.addEventListener('ended', function() {
            seen[pro_or_con] = true;
            if (seen[other(pro_or_con)]) {
              document.querySelectorAll('.checkIconsContainer').forEach(el => {
                el.style.display = 'inline';
              });
            }
          }, false);
          vid.addEventListener('timeupdate', function() {
            var pct = Math.floor((100 / vid.duration) * vid.currentTime);
            prog.style.width = pct + '%';
          }, false);
        }

        function other(p_or_c) {
          return p_or_c === 'pro' ? 'con' : 'pro';
        }

        scope.$on('play-start-pro', function(event, data) {
          playVid('pro');
        });

        scope.$on('play-start-con', function(event, data) {
          playVid('con');
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
          videoElements[pro_con].play();
        }

        function stopPlay(pro_con) {
          videoElements[pro_con].pause();
        }
      }
    };
  }
}());
