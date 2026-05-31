process.env.DB_PATH = ':memory:'
process.env.JWT_SECRET = 'test-secret'
process.env.JWT_EXPIRES_IN = '1h'

const { getDb, closeDb } = require('../src/config/database')
const bcrypt = require('bcryptjs')
const schema = require('../src/db/schema')

function seedTestDb() {
  const db = getDb()
  db.exec(schema)
  db.exec('DELETE FROM leave_requests; DELETE FROM users;')

  const hash = bcrypt.hashSync('password123', 1)
  const insert = db.prepare(`
    INSERT INTO users (name, email, password, role, annual_leave_entitlement)
    VALUES (?, ?, ?, ?, ?)
  `)

  const manager  = insert.run('Test Manager',  'manager@test.com',  hash, 'manager',  20)
  const employee = insert.run('Test Employee', 'employee@test.com', hash, 'employee', 20)
  const emp2     = insert.run('Test Employee2','employee2@test.com',hash, 'employee', 20)

  return {
    managerId:   manager.lastInsertRowid,
    employeeId:  employee.lastInsertRowid,
    employee2Id: emp2.lastInsertRowid
  }
}

function resetDb() {
  const db = getDb()
  db.exec('DELETE FROM leave_requests; DELETE FROM users;')
}

module.exports = { seedTestDb, resetDb, getDb }