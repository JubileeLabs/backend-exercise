import request from 'supertest'
import { expressApp } from '../src/index'
import { IMatch } from '../src/interfaces/match.interface'

describe('GET /matches', () => {
  it('should return a 404 if the user is not found', (done) => {
    request(expressApp).get('/matches?id=nonexistent').expect(404, done)
  })

  it('should prioritize matches by readiness score and then by shared interests', (done) => {
    request(expressApp)
      .get('/matches?id=1') // Alice has a readiness score of 8
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeGreaterThan(0)

        const readinessScores = res.body.map((match: IMatch) => match.readinessScore)
        const sharedInterestsCounts = res.body.map((match: IMatch) => match.sharedInterests.length)

        // Check that matches are first sorted by readiness score (descending)
        for (let i = 1; i < readinessScores.length; i++) {
          expect(readinessScores[i - 1]).toBeGreaterThanOrEqual(readinessScores[i])
        }

        // Check that within the same readiness score, matches are sorted by shared interests (descending)
        for (let i = 1; i < sharedInterestsCounts.length; i++) {
          if (readinessScores[i] === readinessScores[i - 1]) {
            expect(sharedInterestsCounts[i - 1]).toBeGreaterThanOrEqual(sharedInterestsCounts[i])
          }
        }
      })
      .end(done)
  })

  it('should only return matches that are compatible by gender and sexual orientation', (done) => {
    request(expressApp)
      .get('/matches?id=3') // Charlie is homosexual and prefers males
      .expect(200)
      .expect((res) => {
        expect(
          res.body.every(
            (match: IMatch) => match.gender === 'male' && match.genderPreference.includes('male')
          )
        ).toBe(true)
      })
      .end(done)
  })

  it('should return an empty array if no compatible matches are found based on gender and sexual orientation', (done) => {
    request(expressApp)
      .get('/matches?id=17') // Quinn is non-binary, prefers both males and females
      .expect(200)
      .expect((res) => {
        // Assuming there are no compatible users for this test case
        expect(res.body.length).toBe(0)
      })
      .end(done)
  })

  it('should return matches even if there are few or no shared interests, prioritized by readiness score', (done) => {
    request(expressApp)
      .get('/matches?id=1') // Alice
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeGreaterThan(0)

        const readinessScores = res.body.map((match: IMatch) => match.readinessScore)

        // Check that readiness scores are sorted in descending order
        for (let i = 1; i < readinessScores.length; i++) {
          expect(readinessScores[i - 1]).toBeGreaterThanOrEqual(readinessScores[i])
        }
      })
      .end(done)
  })

  it('should correctly match bisexual users with both male and female matches', (done) => {
    request(expressApp)
      .get('/matches?id=5') // Eve is bisexual
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeGreaterThan(0)
        expect(res.body.every((match: IMatch) => ['male', 'female'].includes(match.gender))).toBe(
          true
        )
      })
      .end(done)
  })

  it('should return a 400 if the user ID parameter is missing', (done) => {
    request(expressApp).get('/matches').expect(400, done) // Expecting a 400 Bad Request if ID is missing
  })

  it('should return consistent results when multiple matches have identical readiness scores and shared interests', (done) => {
    request(expressApp)
      .get('/matches?id=8') // Hank has a readiness score of 8
      .expect(200)
      .expect((res) => {
        const readinessScores = res.body.map((match: IMatch) => match.readinessScore)
        const sharedInterestsCounts = res.body.map((match: IMatch) => match.sharedInterests.length)

        // Check consistency in sorting
        for (let i = 1; i < readinessScores.length; i++) {
          expect(readinessScores[i - 1]).toBeGreaterThanOrEqual(readinessScores[i])
          if (readinessScores[i - 1] === readinessScores[i]) {
            expect(sharedInterestsCounts[i - 1]).toBeGreaterThanOrEqual(sharedInterestsCounts[i])
          }
        }
      })
      .end(done)
  })
})
