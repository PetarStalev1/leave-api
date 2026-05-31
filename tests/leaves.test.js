const request = require('supertest')
const app     = require('../src/app')
const { seedTestDb, resetDb, getDb } = require('./helpers')

let employeeToken, managerToken, employeeId, managerId

// Helper for future labor date
function futureDate(daysFromNow) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

async function login(email) {
  const res = await request(app)
    .post('/auth/login')
    .send({ email, password: 'password123' })
  return res.body.data.token
}

beforeEach(async () => {
  resetDb()
  const ids = seedTestDb()
  employeeId = ids.employeeId
  managerId  = ids.managerId

  employeeToken = await login('employee@test.com')
  managerToken  = await login('manager@test.com')
})

describe('GET /users/me/balance', () => {
  it('returns full balance without labor days taken', async () => {
    const res = await request(app)
      .get('/users/me/balance')
      .set('Authorization', `Bearer ${employeeToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.entitlement).toBe(20)
    expect(res.body.data.taken).toBe(0)
    expect(res.body.data.remaining).toBe(20)
  })
})

describe('POST /users/me/leaves', () => {
  it('creates pending querry succsesfully', async () => {
    const res = await request(app)
      .post('/users/me/leaves')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ start_date: futureDate(7), end_date: futureDate(9), leave_type: 'annual' })

    expect(res.status).toBe(201)
    expect(res.body.data.status).toBe('pending')
    expect(res.body.data.working_days).toBeGreaterThan(0)
  })

  it('returns 422 when its a past due date', async () => {
    const res = await request(app)
      .post('/users/me/leaves')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ start_date: '2020-01-01', end_date: '2020-01-05', leave_type: 'annual' })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('PAST_DATE')
  })

  it('returns 422 when unsufficient ballance of days is passed', async () => {
    const res = await request(app)
      .post('/users/me/leaves')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ start_date: futureDate(7), end_date: futureDate(50), leave_type: 'annual' })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('INSUFFICIENT_BALANCE')
  })
})

describe('Manager approve/reject', () => {
  it('manager can approve a pending request', async () => {
    const submit = await request(app)
      .post('/users/me/leaves')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ start_date: futureDate(7), end_date: futureDate(8), leave_type: 'sick' })

    const id = submit.body.data.id

    const res = await request(app)
      .put(`/users/manager/leaves/${id}/approve`)
      .set('Authorization', `Bearer ${managerToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('approved')
  })

  it('manager cannot approve their own leave', async () => {
    const submit = await request(app)
      .post('/users/me/leaves')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ start_date: futureDate(7), end_date: futureDate(8), leave_type: 'sick' })

    const id = submit.body.data.id

    const res = await request(app)
      .put(`/users/manager/leaves/${id}/approve`)
      .set('Authorization', `Bearer ${managerToken}`)

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('CANNOT_ACT_ON_OWN_LEAVE')
  })

  it('employee cannot access manager endpoints', async () => {
    const res = await request(app)
      .get('/users/manager/leaves')
      .set('Authorization', `Bearer ${employeeToken}`)

    expect(res.status).toBe(403)
  })
})

describe('DELETE /users/me/leaves/:id', () => {
  it('cancels a pending leave', async () => {
    const submit = await request(app)
      .post('/users/me/leaves')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ start_date: futureDate(7), end_date: futureDate(8), leave_type: 'sick' })

    const id = submit.body.data.id

    const res = await request(app)
      .delete(`/users/me/leaves/${id}`)
      .set('Authorization', `Bearer ${employeeToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('cancelled')
  })
})