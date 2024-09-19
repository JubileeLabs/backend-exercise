import express from 'express'
import { USERS } from './users.data'
import { IUser } from './interfaces/user.interface'
import { IMatch } from './interfaces/match.interface'

export const expressApp = express()

// TODO: Implement the /matches route

expressApp.get('/matches', (req, res) => {
  const userId = req.query.id

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  const user = USERS.find((user) => user.id === userId)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  const matches = getMatches(user)
  res.json(matches)
})

function getMatches(user: IUser): IMatch[] {
  const matches = USERS.filter((otherUser) => {
    if (otherUser.id === user.id) return false

    const userPreference = user.genderPreference
    const matchGender = otherUser.gender
    const matchPreference = otherUser.genderPreference
    const userGender = user.gender

    const userLikesMatch = userPreference.includes(matchGender)
    const matchLikesUser = matchPreference.includes(userGender)

    return userLikesMatch && matchLikesUser
  })
    .map((otherUser) => ({
      user1: user,
      user2: otherUser,
      sharedInterests: user.interests.filter((i: string) => otherUser.interests.includes(i)),
      interestCount: user.interests.filter((i: string) => otherUser.interests.includes(i)).length,
      readinessScoreDifference: Math.abs(user.readinessScore - otherUser.readinessScore),
    }))
    .sort((a, b) => {
      if (a.readinessScoreDifference !== b.readinessScoreDifference) {
        return a.readinessScoreDifference - b.readinessScoreDifference
      }
      return b.interestCount - a.interestCount
    })
    .slice(0, 5)

  return matches
}
