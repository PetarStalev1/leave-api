const {AppError} = require('../utils/errors')

function errorHandler(err,req,res,next)
{
    if(err instanceof AppError)
    {
        const body = {error: {code:err.code, message: err.message}}
        if(err.details) body.error.details = err.details
        return res.status(err.status).json(body)
    }

    if(err.code === 'SQLITE_CONSTRAINT_UNIQUE')
    {
        return res.status(409).json(
            {
                error: { code: 'CONFLICT', message: 'A record with that value already exists.'}
            }
        )
    }

    console.error('Unhandled error', err)
    return res.status(500).json({
        error: {code: 'INTERNAL_ERROR', message:'An unexpected error occured.'}
    })
}

module.exports = {errorHandler}