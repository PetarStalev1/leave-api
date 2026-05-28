const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {getDb} = require('../../config/database')
const {Errors} = require('../../utils/errors')
const {success} = require('../../utils/response')

function login(req,res,next) 
{
    try {
        
        const {email, password} = req.body

        if(!email || !password)
        {
            throw Errors.validation('cant be empty')
        }

        const dB = getDb()
        const user = dB.prepare('SELECT * FROM users WHERE email = ?').get(email)

        if(!user || !bcrypt.compareSync(password,user.password))
        {
            throw Errors.invalidCredentials()
        }

        const token = jwt.sign(
            {userId:user.id,role:user.role},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN || '8h'}
        )


        return success(res, {
            
            token,
            user: {
                id: user.id, 
                name: user.name,
                email:user.email,
                role:user.role
            }
        })


    } catch (error) {
        next(error)
    }
}

module.exports = {login}