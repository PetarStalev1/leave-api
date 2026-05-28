const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDb } = require('../../config/database')

function login (req,res, next)
{

    const { email, password } = req.body
    
    if(!email || !password)
    {
        return res.status(400).json(
            {
                error: {
                    message: 'email and password are required.'
                }
            }
        )
    }

    const dB = getDb()
    const user = dB.prepare('SELECT * FROM users WHERE email = ?').get(email)

    if(!user || !bcrypt.compareSync(password, user.password))
    {
         return res.status(401).json(
            {
                error: {
                    message: 'email or password are wrong.'
                }
            }
        )
    }

    const userToGiveToken = { userId: user.id, role: user.role }
    const token = jwt.sign(
        userToGiveToken,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    )

    return res.status(200).json({
        data: {
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role }
        }
    })
}

module.exports = { login }