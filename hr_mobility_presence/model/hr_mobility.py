# -*- coding: utf-8 -*-
from odoo import models, fields, api, exceptions, _, SUPERUSER_ID


class HrEmployee(models.Model):
    _inherit = "hr.employee"
    _description = "Employee"

    @api.multi
    def _compute_qr_attendance(self):
        for employee in self:
             employee.qr_attendance = employee.user_id.has_group(
                 'hr_mobility_presence.group_hr_qr_attendance_user') if employee.user_id else False

    @api.multi
    def _inverse_qr_attendance(self):
        qr_attendance_group = self.env.ref('hr_mobility_presence.group_hr_qr_attendance_user')
        for employee in self:
            if employee.user_id:
                if employee.qr_attendance:
                    qr_attendance_group.users = [(4, employee.user_id.id, 0)]
                else:
                    qr_attendance_group.users = [(3, employee.user_id.id, 0)]

    @api.multi
    def qr_manual_attendance(self, next_action, entered_pin=None):
        self.ensure_one()
        if not (entered_pin is None) or self.env['res.users'].browse(SUPERUSER_ID).has_group(
                'hr_attendance.group_hr_attendance_use_pin') and (
                self.user_id and self.user_id.id != self._uid or not self.user_id):
            if entered_pin != self.pin:
                return {'warning': _('Wrong PIN')}
        return self.attendance_action(next_action)

    qr_attendance = fields.Boolean(string='Qr Attendance', compute='_compute_qr_attendance', inverse='_inverse_qr_attendance',
                                   help='The employer can scan the Qr code from diferents sites')





