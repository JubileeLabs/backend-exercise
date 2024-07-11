import request from 'supertest'
import { describe, it } from 'mocha'
import { app } from '../src/index'

describe('GET /match', () => {
  it('should return a 404 if the user is not found', (done) => {
    request(app).get('/match?id=nonexistent').expect(404, done)
  })

  it('should return matches based on shared interests, readiness score, and preferences', (done) => {
    request(app)
      .get('/match?id=1')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeGreaterThan(0)
        expect(res.body[0].sharedInterests).toBeDefined()
        expect(res.body[0].readinessScore).toBeDefined()
      })
      .end(done)
  })

  it('should not match users with different gender or sexual orientation preferences', (done) => {
    request(app)
      .get('/match?id=3')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(0)
      })
      .end(done)
  })
})
