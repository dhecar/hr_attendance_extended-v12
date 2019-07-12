odoo.define('hr_mobility_presence.greeting_message', function (require) {
"use strict";

var core = require('web.core');
var Widget = require('web.Widget');

var _t = core._t;

var  GreetingMessage = core.action_registry.get('hr_attendance_greeting_message');


GreetingMessage.include({

        init : function (parent, action){
            this.next_action = action.next_action || 'hr_mobility_presence.hr_attendance_my_qr_attendances';
            this._super.apply(this, arguments)
        }
    });



});




