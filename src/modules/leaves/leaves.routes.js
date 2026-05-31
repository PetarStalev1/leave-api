const express = require('express')
const router = express.Router()
const {authenticate, requireRole} = require('../../middleware/auth')
const c = require('./leaves.controller')
const v = require('./leaves.validator')

router.get('/me/balance', authenticate, c.getBalance)
router.get('/me/leaves', authenticate, v.validateListQuery, c.listMyLeaves)
router.post('/me/leaves', authenticate, v.validateSubmitBody, c.submitLeave)
router.get('/me/leaves/:id', authenticate, c.getMyLeave)
router.delete('/me/leaves/:id', authenticate, c.cancelLeave)


router.get('/manager/leaves',authenticate, requireRole('manager'), v.validateManagerListQuery, c.listPending)
router.put('/manager/leaves/:id/approve', authenticate, requireRole('manager'), c.approveLeave)
router.put('/manager/leaves/:id/reject', authenticate, requireRole('manager'), c.rejectLeave)

module.exports = router;