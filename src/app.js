const express = require('express');
const app = express();

require('dotenv').config()
const {getDb} = require('./config/database')
const schema = require('./db/schema')

const db = getDb();
db.exec(schema)

app.use(express.json());

app.get('/health' ,  (req,res) => {
    res.json({ status: 'ok' })
})

app.get('/' ,  (req,res) => {
    res.json({ status: 'ok' })
})

const PORT = 3000

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${3000}`)
})

module.exports = app