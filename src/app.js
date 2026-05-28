require('dotenv').config()

const express = require('express');
const {getDb} = require('./config/database')
const schema = require('./db/schema')
const authRoutes = require('./modules/auth/auth.routes')
const {errorHandler} = require('./middleware/errorHandler')

const app = express();
const db = getDb();
db.exec(schema)

app.use(express.json());

app.use('/auth', authRoutes)

app.get('/health' ,  (req,res) => {
    res.json({ status: 'ok' })
})


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${3000}`)
})







module.exports = app