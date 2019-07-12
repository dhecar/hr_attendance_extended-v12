odoo.define('hr_attendance_mobility.attendances', function (require) {
"use strict";

var AbstractAction = require('web.AbstractAction');
var core = require('web.core');
var rpc = require('web.rpc');
var QWeb = core.qweb;
var _t = core._t;


var QrAttendances = AbstractAction.extend({

   events: {
        'click .qr_device': 'qr_device'
   },
   template: 'QrScan',
   willStart: function () {
        var self = this;
        var def = this._rpc({
                model: 'hr.employee',
                method: 'search_read',
                args: [[['user_id', '=', this.getSession().uid]], ['attendance_state', 'name']],
            })
            .then(function (res) {
                self.employee = res[0];
                self.$el.html(QWeb.render("QrScan", {widget: self}));
                    if (_.isEmpty(res) ) {
                        return;
                    }
            });
         return $.when(def, this._super.apply(this, arguments));
   },
   drawLine: function (begin, end, color) {
      var canvasElement = document.getElementById("canvas");
      var canvas = canvasElement.getContext("2d");
      canvas.beginPath();
      canvas.moveTo(begin.x, begin.y);
      canvas.lineTo(end.x, end.y);
      canvas.lineWidth = 4;
      canvas.strokeStyle = color;
      canvas.stroke();
   },
   qr_device: function(){
        var self = this;
        //Render Capture Page
        this.$el.html(QWeb.render("QrActivate", {widget: self}))
         // Older browsers might not implement mediaDevices at all, so we set an empty object first
        if (navigator.mediaDevices === undefined) {
          navigator.mediaDevices = {};
        }
        // Some browsers partially implement mediaDevices. We can't just assign an object
        // with getUserMedia as it would overwrite existing properties.
        // Here, we will just add the getUserMedia property if it's missing.
        if (navigator.mediaDevices.getUserMedia === undefined) {
          navigator.mediaDevices.getUserMedia = function(constraints) {

            // First get ahold of the legacy getUserMedia, if present
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if (!getUserMedia) {
              return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise(function(resolve, reject) {
              getUserMedia.call(navigator, constraints, resolve, reject);
            });
          }
        }

        navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode:  "environment" }})
        .then(function(stream) {
          var video = document.createElement("video");
          // Older browsers may not have srcObject
          if ("srcObject" in video) {
            video.srcObject = stream;
          } else {
            // Avoid using this in new browsers, as it is going away.
            video.src = window.URL.createObjectURL(stream);
          }
          video.setAttribute("playsinline", true);
          video.setAttribute('height', '150');

          video.onloadedmetadata = function(e) {
            video.play();
                requestAnimationFrame(tick);

                 ////////////////////////////////
                 function tick() {

                      if (video.readyState === video.HAVE_ENOUGH_DATA) {
                        var canvasElement = document.getElementById("canvas");
                        var canvas = canvasElement.getContext("2d");
                        var loadingMessage = document.getElementById("loadingMessage");
                        var outputContainer = document.getElementById("output");
                        var outputMessage = document.getElementById("outputMessage");
                        var outputData = document.getElementById("outputData");
                        loadingMessage.hidden = true;
                        canvasElement.hidden = false;
                        outputContainer.hidden = false;
                        canvasElement.height = video.videoHeight;
                        canvasElement.width = video.videoWidth;
                        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
                        var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
                        var code = jsQR(imageData.data, imageData.width, imageData.height, {
                          inversionAttempts: "dontInvert",
                        });
                        if (code) {
                          self.drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
                          self.drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
                          self.drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
                          self.drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
                          /*outputMessage.hidden = true;
                          outputData.parentElement.hidden = false;
                          outputData.innerText = code.data;*/
                          //Grab information in DB
                          self.qr_attendance(code.data);
                          //Close streams
                          stream.getTracks().forEach(track => track.stop())
                          // Exit function
                          return

                        } else {
                          outputMessage.hidden = false;
                          outputData.parentElement.hidden = true;
                        }
                      }
                      requestAnimationFrame(tick);
                 }

                 ////////////////////////////////

          }


        })
        .catch(function(err) {
          console.log(err.name + ": " + err.message);
        });



   },
   qr_attendance: function (code) {
        var self = this;
        this._rpc({
                model: 'hr.employee',
                method: 'qr_manual_attendance',
                args: [[self.employee.id], 'hr_mobility_presence.hr_attendance_my_qr_attendances'],
            })
            .then(function(result) {
                if (result.action) {
                    self.do_action(result.action);
                     var qr_value = {
                        partner_id: code,
                     };

                    rpc.query({
                        model: 'hr.attendance',
                        method: 'write',
                        args: [result.action.attendance.id , qr_value ]
                    })

                    //Enviar email al cliente

                } else if (result.warning) {
                    self.do_warn(result.warning);
                }
            });
   },
});

core.action_registry.add('hr_attendance_my_qr_attendances', QrAttendances);

return QrAttendances;

});
