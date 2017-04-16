/* global RecordRTC WhammyRecorder StereoAudioRecorder startRecording */
/* eslint new-cap: 0 */
/* eslint no-alert: 0 */

(function () {
  'use strict';

  angular
    .module('flipflops')
    .directive('recvid', recVidDirective);

  recVidDirective.$inject = ['$http'];

  function recVidDirective($http) {
    return {
      restrict: 'E',
      bindController: true,
      templateUrl: '/modules/flipflops/client/views/rec-vid.template.html',
      link: function(scope, element, attributes, controller) {

        // console.log(scope.vm.flipflop);
        // var btnStartRecording = document.querySelector('#btn-start-recording');
        // var btnStopRecording = document.querySelector('#btn-stop-recording');
        var videoElements = {};
        videoElements.pro = document.querySelector('#provid');
        videoElements.con = document.querySelector('#convid');
        // var videoProElement = document.querySelector('#provid');
        // var videoConElement = document.querySelector('#convid');
        var progressBar = document.querySelector('#progress-bar');
        var percentage = document.querySelector('#percentage');
        var currentBrowser = !!navigator.mozGetUserMedia ? 'gecko' : 'chromium';
        var fileName;
        var audioRecorder;
        var videoRecorder;
        var mediaStream = null;
        var av_rec_data = {
          'pro': {},
          'con': {}
        };

        var isRecordOnlyAudio = !!navigator.mozGetUserMedia;
        if (isRecordOnlyAudio && currentBrowser === 'chromium') {
          var parentNode = videoElements.pro.parentNode;
          parentNode.removeChild(videoElements.pro);

          videoElements.pro = document.createElement('audio');
          videoElements.pro.style.padding = '.4em';
          videoElements.pro.controls = true;
          parentNode.appendChild(videoElements.pro);
        }

        scope.$on('rec-start-pro', function(event, data) {
          startRecording('pro');
        });

        scope.$on('rec-start-con', function(event, data) {
          startRecording('con');
        });

        scope.$on('rec-stop-pro', function(event, data) {
          stopRecording('pro');
        });

        scope.$on('rec-stop-con', function(event, data) {
          stopRecording('con');
        });

        scope.$on('post-files', function(event, data) {
          postFiles(av_rec_data);
        });

        // function postFiles(audio, video) {
        function postFiles(av_rec_data) {
          var pro = {};
          var con = {};
          var data = {
            pro: {},
            con: {}
          };
          pro.audio = av_rec_data.pro.audio;
          pro.video = av_rec_data.pro.video;
          con.audio = av_rec_data.con.audio;
          con.video = av_rec_data.con.video;
          fileName = generateRandomString();

          data.pro.audio = {
            name: fileName + '.' + pro.audio.blob.type.split('/')[1], // MUST be wav or ogg
            type: pro.audio.blob.type,
            contents: pro.audio.dataURL
          };
          console.log(con.audio);
          data.con.audio = {
            name: fileName + '.' + con.audio.blob.type.split('/')[1], // MUST be wav or ogg
            type: con.audio.blob.type,
            contents: con.audio.dataURL
          };
          if (pro.video) {
            data.pro.video = {
              name: fileName + '.' + pro.video.blob.type.split('/')[1], // MUST be webm or mp4
              type: pro.video.blob.type,
              contents: pro.video.dataURL
            };
          }
          if (con.video) {
            data.con.video = {
              name: fileName + '.' + con.video.blob.type.split('/')[1], // MUST be webm or mp4
              type: con.video.blob.type,
              contents: con.video.dataURL
            };
          }
          data.pro.uploadOnlyAudio = !pro.video;
          data.con.uploadOnlyAudio = !con.video;
          // videoElements.src = '';
          // videoElements.poster = '/ajax-loader.gif';

          $http({
            method: 'POST',
            url: '/api/upload',
            data: JSON.stringify(data)
          }).then(function successCallback(response) {
            console.log('received response');
            console.log(response);
          }, function errorCallback(response) {
            console.log('fail response');
            console.log(response);
          });

        //   xhr('/api/upload', JSON.stringify(files), function(_fileName) {
        //     var href = location.href.substr(0, location.href.lastIndexOf('/') + 1);
        //     videoElements.pro.src = href + '/api/upload/' + _fileName;
        //     videoElements.pro.play();
        //     videoElements.pro.muted = false;
        //     videoElements.pro.controls = true;
        //   });

        //   // if (mediaStream) mediaStream.stop();
        // }

        // function xhr(url, data, callback) {
        //   var request = new XMLHttpRequest();
        //   request.onreadystatechange = function() {
        //     if (request.readyState === 4 && request.status === 200) {
        //       callback(request.responseText);
        //     }
        //   };

          // request.upload.onprogress = function(event) {
          //   progressBar.max = event.total;
          //   progressBar.value = event.loaded;
          //   progressBar.innerHTML = 'Upload Progress ' + Math.round(event.loaded / event.total * 100) + '%';
          // };

          // request.upload.onload = function() {
          //   percentage.style.display = 'none';
          //   progressBar.style.display = 'none';
          // };

          // console.log(data);
          // request.open('POST', url);
          // request.send(data);
        }

        function generateRandomString() {
          if (window.crypto) {
            var a = window.crypto.getRandomValues(new Uint32Array(3)),
              token = '';
            for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
            return token;
          } else {
            return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
          }
        }

        function onStopRecording(pro_con) {

          audioRecorder.getDataURL(function(audioDataURL) {
            var audio = {
              blob: audioRecorder.getBlob(),
              dataURL: audioDataURL
            };

            // if record both wav and webm
            if (!isRecordOnlyAudio) {
              audio.blob = new File([audio.blob], 'audio.wav', {
                type: 'audio/wav'
              });

              videoRecorder.getDataURL(function(videoDataURL) {
                var video = {
                  blob: videoRecorder.getBlob(),
                  dataURL: videoDataURL
                };

                av_rec_data[pro_con] = {
                  'audio': audio,
                  'video': video
                };
                console.log(av_rec_data);
                // postFiles(audio, video);
                if (mediaStream) mediaStream.stop();
              });
              return;
            }

            // if record only audio (either wav or ogg)
            if (isRecordOnlyAudio) {
              // postFiles(audio);
              if (mediaStream) mediaStream.stop();
            }

          });
        }

        // var mediaStream = null;
        // reusable getUserMedia
        function captureUserMedia(success_callback) {
          var session = {
            audio: true,
            video: true
          };

          navigator.getUserMedia(session, success_callback, function(error) {
            alert(JSON.stringify(error));
          });
        }

        // btnStartRecording.onclick = function() {
        function startRecording(pro_con) {
        // btnStartRecording.disabled = true;

          captureUserMedia(function(stream) {
            mediaStream = stream;
            videoElements[pro_con].src = window.URL.createObjectURL(stream);
            videoElements[pro_con].play();
            videoElements[pro_con].muted = true;
            videoElements[pro_con].controls = false;

            // it is second parameter of the RecordRTC
            var audioConfig = {
              sampleRate: 24000,
              width: 240,
              height: 180
            };

            if (currentBrowser === 'chromium') {
              audioConfig.recorderType = StereoAudioRecorder;
            }

            if (!isRecordOnlyAudio) {
              audioConfig.onAudioProcessStarted = function() {
              // invoke video recorder in this callback
              // to get maximum sync
                videoRecorder.startRecording();
              };
            }

            audioRecorder = RecordRTC(stream, audioConfig);

            if (!isRecordOnlyAudio) {
            // it is second parameter of the RecordRTC
              var videoConfig = {
                type: 'video',
                video: {
                  width: 240,
                  height: 180
                },
                canvas: {
                  width: 240,
                  height: 180
                }
              };

              if (currentBrowser === 'chromium') {
                audioConfig.recorderType = WhammyRecorder;
              }

              videoRecorder = RecordRTC(stream, videoConfig);
              videoRecorder.startRecording();
            }

            audioRecorder.startRecording();

              // enable stop-recording button
              // btnStopRecording.disabled = false;
          });
        }


        // btnStopRecording.onclick = function() {
        function stopRecording(pro_con) {
          // btnStartRecording.disabled = false;
          // btnStopRecording.disabled = true;
          if (isRecordOnlyAudio) {
            audioRecorder.stopRecording(onStopRecording);
            return;
          }

          if (!isRecordOnlyAudio) {
            audioRecorder.stopRecording(function() {
              videoRecorder.stopRecording(function() {
                onStopRecording(pro_con);
              });
            });
          }
        }

        window.onbeforeunload = function() {
          startRecording.disabled = false;
        };

      }
    };
  }
}());
