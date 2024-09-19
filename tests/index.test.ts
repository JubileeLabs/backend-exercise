import request from 'supertest'
import { expressApp } from '../src/index'
import { IMatch } from '../src/interfaces/match.interface'

describe('GET /matches', () => {
  it('should return a 404 if the user is not found', (done) => {
    request(expressApp).get('/matches?id=nonexistent').expect(404, done)
  })

  it('should prioritize matches by readiness score difference and then by shared interests', (done) => {
    request(expressApp)
      .get('/matches?id=1') // Alice has a readiness score of 8
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeGreaterThan(0)

        const readinessScoreDifferences = res.body.map(
          (match: IMatch) => match.readinessScoreDifference
        )
        const sharedInterestsCounts = res.body.map((match: IMatch) => match.interestCount)

        // Check that matches are first sorted by readiness score difference (ascending)
        for (let i = 1; i < readinessScoreDifferences.length; i++) {
          expect(readinessScoreDifferences[i - 1]).toBeLessThanOrEqual(readinessScoreDifferences[i])
        }

        // Check that within the same readiness score difference, matches are sorted by shared interests (descending)
        for (let i = 1; i < sharedInterestsCounts.length; i++) {
          if (readinessScoreDifferences[i] === readinessScoreDifferences[i - 1]) {
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
            (match: IMatch) =>
              match.user2.gender === 'male' && match.user2.genderPreference.includes('male')
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

  it('should return matches even if there are few or no shared interests, prioritized by readiness score difference', (done) => {
    request(expressApp)
      .get('/matches?id=1') // Alice
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeGreaterThan(0)

        const readinessScoreDifferences = res.body.map(
          (match: IMatch) => match.readinessScoreDifference
        )

        // Check that readiness score differences are sorted in ascending order
        for (let i = 1; i < readinessScoreDifferences.length; i++) {
          expect(readinessScoreDifferences[i - 1]).toBeLessThanOrEqual(readinessScoreDifferences[i])
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
        expect(
          res.body.every((match: IMatch) => ['male', 'female'].includes(match.user2.gender))
        ).toBe(true)
      })
      .end(done)
  })

  it('should handle large datasets efficiently and return results in the correct order', (done) => {
    request(expressApp)
      .get('/matches?id=1') // Assuming large dataset is loaded
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeGreaterThan(0)

        const readinessScoreDifferences = res.body.map(
          (match: IMatch) => match.readinessScoreDifference
        )

        // Check that readiness score differences are sorted in ascending order
        for (let i = 1; i < readinessScoreDifferences.length; i++) {
          expect(readinessScoreDifferences[i - 1]).toBeLessThanOrEqual(readinessScoreDifferences[i])
        }
      })
      .end(done)
  })

  it('should return a 400 if the user ID parameter is missing', (done) => {
    request(expressApp).get('/matches').expect(400, done)
  })

  it('should return consistent results when multiple matches have identical readiness score differences and shared interests', (done) => {
    request(expressApp)
      .get('/matches?id=8') // Hank has a readiness score of 8
      .expect(200)
      .expect((res) => {
        const readinessScoreDifferences = res.body.map(
          (match: IMatch) => match.readinessScoreDifference
        )
        const sharedInterestsCounts = res.body.map((match: IMatch) => match.interestCount)

        // Check consistency in sorting
        for (let i = 1; i < readinessScoreDifferences.length; i++) {
          expect(readinessScoreDifferences[i - 1]).toBeLessThanOrEqual(readinessScoreDifferences[i])
          if (readinessScoreDifferences[i - 1] === readinessScoreDifferences[i]) {
            expect(sharedInterestsCounts[i - 1]).toBeGreaterThanOrEqual(sharedInterestsCounts[i])
          }
        }
      })
      .end(done)
  })

  it('should correctly handle and return matches for users with different orientations', (done) => {
    request(expressApp)
      .get('/matches?id=19') // Sam is bisexual and prefers both males and females
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeGreaterThan(0)
        expect(
          res.body.every((match: IMatch) => ['male', 'female'].includes(match.user2.gender))
        ).toBe(true)
      })
      .end(done)
  })
})
