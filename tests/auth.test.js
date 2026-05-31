const request = require('supertest')
const app     = require('../src/app')
const { seedTestDb, resetDb } = require('./helpers')

beforeEach(() => {
  resetDb()
  seedTestDb()
})

describe('POST /auth/login', () => {

  it('returns a token when valid data is passed', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'employee@test.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.role).toBe('employee')
  })

  it('returns 401 when a incorect password is passed', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'employee@test.com', password: 'greshna' })

    expect(res.status).toBe(401)
  })

  it('returns 400 if fields are empty', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: '', password: '' })

    expect(res.status).toBe(400)
  })

  it('returns 401 without token on protected endpoints', async () => {
    const res = await request(app)
      .get('/users/me/balance')

    expect(res.status).toBe(401)
  })

})