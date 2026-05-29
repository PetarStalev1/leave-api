require('dotenv').config()

const express = require('express');
const {getDb} = require('./config/database')
const schema = require('./db/schema')
const authRoutes = require('./modules/auth/auth.routes')
const {errorHandler} = require('./middleware/errorHandler')
const leaveRoutes = require('./modules/leaves/leaves.routes')
const app = express();
const db = getDb();
db.exec(schema)

app.use(express.json());

app.use('/auth', authRoutes)
app.use('/users', leaveRoutes)
app.get('/health' ,  (req,res) => {
    res.json({ status: 'ok' })
})


app.use(errorHandler)
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${3000}`)
})







module.exports = app