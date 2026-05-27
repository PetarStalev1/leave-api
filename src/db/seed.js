require('dotenv').config()
const bcrypt = require('bcryptjs')
const { getDb } = require('../config/database')
const schema = require('./schema')

const db = getDb()
db.exec(schema)

db.exec('DELETE FROM leave_requests; DELETE FROM users;')

const hash = bcrypt.hashSync('password123',10)

const insert = db.prepare(`
    INSERT INTO users (name, email, password, role, annual_leave_entitlement) 
    VALUES (?, ?, ?, ?, ?)    
`)

const manager  = insert.run('Maria Petrova',   'maria@craftberry.com',  hash, 'manager',  20)
const ivan     = insert.run('Ivan Georgiev',   'ivan@craftberry.com',   hash, 'employee', 20)
const elena    = insert.run('Elena Todorova',  'elena@craftberry.com',  hash, 'employee', 20)
const georgi   = insert.run('Georgi Dimitrov', 'georgi@craftberry.com', hash, 'employee', 20)

console.log('users seeded')


const leave = db.prepare(`
    INSERT INTO leave_requests (user_id, start_date, end_date, leave_type, status, working_days, updated_at)   
    
    VALUES (?,?,?,?,?,?, datetime('now'))
`)

leave.run(ivan.lastInsertRowid, '2026-01-06', '2026-01-10', 'annual', 'approved', 5)
leave.run(ivan.lastInsertRowid, '2026-06-01', '2026-06-05', 'annual', 'pending',  5)

leave.run(elena.lastInsertRowid, '2026-02-10', '2026-02-12', 'sick',   'approved', 3)
leave.run(elena.lastInsertRowid, '2026-07-14', '2026-07-18', 'annual', 'pending',  5)


leave.run(georgi.lastInsertRowid, '2026-03-16', '2026-03-20', 'unpaid', 'approved', 5)

console.log('leave requests created')
console.log('  maria@craftberry.com,/ password123  (manager)')
console.log('  ivan@craftberry.com, / password123  (employee)')
console.log('  elena@craftberry.com,/ password123  (employee)')
console.log('  georgi@craftberry.com/ password123  (employee)')