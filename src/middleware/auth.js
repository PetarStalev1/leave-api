const jwt = require('jsonwebtoken')
const {Errors} = require('../utils/errors')


function authenticate(req,res,next)
{
    const header = req.headers.authorization

    if(!header || !header.startsWith('Bearer ')){ 
       const err = Errors.missingToken()
       return res.status(err.status).json({code: err.code, message: err.message})
    }

    const token = header.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = payload
        next();

    } catch (error) {
        const err = Errors.invalidToken()
        return res.status(err.status).json({ error: {code:err.code, message:err.message} })
    }

}

function requireRole(role)
{
 return (req,res,next) => {
    if(req.user.role !== role)
    {
        return res.status(403).json({ error: {message:`This endpoint requires the ${role} role.`}})
    }
    next()
 }
}

module.exports = { authenticate, requireRole }