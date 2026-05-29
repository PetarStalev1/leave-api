const service = requrie('./leaves.service')
const { success,created } = require('../../utils/response')

function getBalance(req,res,next) 
{
    try {
        const balance = service.getBalance(req.user.userId)
        return success(res,balance)

    } catch (error) {
        next(error)
    }
}

function submitLeave(req,res,next)
{
    try {
        const leave = service.submitLeave(req.user.userId, req.body)
        return created(res, leave)
    } catch (error) {
        next(error)
    }
}

function listMyLeaves(req, res, next)
{
    try {
        const listedLeaves = service.listMyLeaves(req.user.userId,req.query)
        return success(res,listedLeaves)
    } catch (error) {
        next(error)
    }
}

function getMyLeave(req,res,next)
{
    try {
        const getMyLeaving = service.getMyLeave(req.user.userId, Number(req.params.id))
        return success(res, getMyLeaving)
    } catch (error) {
        next(error)
    }
}

function cancelLeave(req,res,next)
{
    try {
        const cancelMyLeaving = service.cancelLeave(req.user.userId, Number(req.params.id))
        return success(res,cancelMyLeaving)
    } catch (error) {
        next(error)
    }
}

function listPending(req,res,next)
{
    try {
        const listPendingLeaves = service.listPending(req.query)
        return success(res, listPendingLeaves)

    } catch (error) {
        next(error)
    }
}

function approveLeave(req,res,next)
{
    try {
        
        const approveMyLeave = service.approveLeave(req.user.userId, Number(req.params.id))
        return success(res,approveMyLeave)
    } catch (error) {
        next(error)
    }
}

function rejectLeave(req,res,next)
{
    try {

        const isLeaveRejected = service.rejectLeave(req.user.userId, Number(req.params.id), req.body.reason)
        return success(res,isLeaveRejected)

    } catch (error) {
        next(error)
    }
}

module.exports = {
getBalance,
submitLeave,
listMyLeaves,
getMyLeave,
cancelLeave,
listPending,
approveLeave,
rejectLeave
}