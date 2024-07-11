import request from 'supertest'
import { expressApp } from '../src/index'

describe('GET /matches', () => {
  it('should return a 404 if the user is not found', (done) => {
    request(expressApp).get('/matches?id=nonexistent').expect(404, done)
  })

  it('should return matches based on shared interests, readiness score, and preferences', (done) => {
    request(expressApp)
      .get('/matches?id=1')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeGreaterThan(0)
        expect(res.body[0].sharedInterests).toBeDefined()
        expect(res.body[0].readinessScore).toBeDefined()
      })
      .end(done)
  })

  it('should not match users with different gender or sexual orientation preferences', (done) => {
    request(expressApp)
      .get('/matches?id=3')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(15)
      })
      .end(done)
  })
})
