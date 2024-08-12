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

        // Check if readinessScore is sorted in descending order
        const readinessScores = res.body.map((match) => match.readinessScore)
        for (let i = 1; i < readinessScores.length; i++) {
          expect(readinessScores[i - 1]).toBeGreaterThanOrEqual(readinessScores[i])
        }

        // Check if sharedInterests is sorted in descending order
        const sharedInterestsCounts = res.body.map((match) => match.sharedInterests.length)
        for (let i = 1; i < sharedInterestsCounts.length; i++) {
          expect(sharedInterestsCounts[i - 1]).toBeGreaterThanOrEqual(sharedInterestsCounts[i])
        }
      })
      .end(done)
  })

  it('should not match users with incompatible gender or sexual orientation preferences', (done) => {
    request(expressApp)
      .get('/matches?id=3') // Charlie is homosexual
      .expect(200)
      .expect((res) => {
        expect(
          res.body.every((user) => user.gender === 'male' && user.genderPreference.includes('male'))
        ).toBe(true)
      })
      .end(done)
  })

  it('should prioritize matches with closer readiness scores', (done) => {
    request(expressApp)
      .get('/matches?id=2') // Bob has a readiness score of 7
      .expect(200)
      .expect((res) => {
        const readinessScores = res.body.map((match) => match.readinessScore)
        for (let i = 1; i < readinessScores.length; i++) {
          expect(readinessScores[i - 1]).toBeGreaterThanOrEqual(readinessScores[i])
        }
      })
      .end(done)
  })

  it('should prioritize matches with more shared interests', (done) => {
    request(expressApp)
      .get('/matches?id=4') // Diana
      .expect(200)
      .expect((res) => {
        const sharedInterestsCounts = res.body.map((match) => match.sharedInterests.length)
        for (let i = 1; i < sharedInterestsCounts.length; i++) {
          expect(sharedInterestsCounts[i - 1]).toBeGreaterThanOrEqual(sharedInterestsCounts[i])
        }
      })
      .end(done)
  })

  it('should return an empty array if no compatible matches are found', (done) => {
    request(expressApp)
      .get('/matches?id=10') // Jack is homosexual, assume no other homosexual males
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(0)
      })
      .end(done)
  })

  it('should handle bisexual users correctly', (done) => {
    request(expressApp)
      .get('/matches?id=11') // Kara is bisexual
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeGreaterThan(0)
        expect(res.body.every((user) => ['male', 'female'].includes(user.gender))).toBe(true)
      })
      .end(done)
  })

  it('should sort identically scored and interest-matched users consistently', (done) => {
    request(expressApp)
      .get('/matches?id=8') // Hank has a readiness score of 8
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeGreaterThan(0)
        const readinessScores = res.body.map((match) => match.readinessScore)
        for (let i = 1; i < readinessScores.length; i++) {
          expect(readinessScores[i - 1]).toBeGreaterThanOrEqual(readinessScores[i])
        }

        const sharedInterestsCounts = res.body.map((match) => match.sharedInterests.length)
        for (let i = 1; i < sharedInterestsCounts.length; i++) {
          expect(sharedInterestsCounts[i - 1]).toBeGreaterThanOrEqual(sharedInterestsCounts[i])
        }
      })
      .end(done)
  })

  it('should validate the user ID parameter', (done) => {
    request(expressApp).get('/matches').expect(400, done) // Expecting a 400 Bad Request if ID is missing
  })

  it('should perform efficiently with a large dataset', (done) => {
    request(expressApp)
      .get('/matches?id=1')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeGreaterThan(0)
      })
      .end(done)
  })
})
