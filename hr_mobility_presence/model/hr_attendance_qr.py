# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
from odoo import models, fields, api, exceptions, _

class HrAttendance(models.Model):

    _inherit = "hr.attendance"

    partner_id = fields.Many2one('res.partner', string="Partner", required=True, ondelete='cascade', index=True)






