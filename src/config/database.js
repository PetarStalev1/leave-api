require('dotenv').config()
const Database = require('better-sqlite3')
const path = require('path')

let db 


function getDb()
{
    if(!db)
    {
        db = new Database(path.resolve(process.env.DB_PATH || './database.sqlite'))
        db.pragma('foreign_keys = ON')
    }

    return db
}

module.exports = { getDb }