function success(res, data, status = 200)
{
    return res.status(status).json({data})
}

function created(res,data)
{
    return success(res,data,201)
}

module.exports = {success, created}