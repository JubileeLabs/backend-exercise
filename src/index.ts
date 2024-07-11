import express from 'express'
import { USERS } from './users.data'

export const app = express()
const port = 3000

app.get('/match', (req, res) => {
  const userId = req.query.id as string
  const user = USERS.find((u) => u.id === userId)

  if (!user) {
    return res.status(404).send('User not found')
  }

  const matches = USERS.filter((u) => u.id !== user.id)
    .filter((u) => u.gender === user.gender && u.sexualOrientation === user.sexualOrientation)
    .map((u) => ({
      id: u.id,
      name: u.name,
      sharedInterests: user.interests.filter((interest) => u.interests.includes(interest)),
      readinessScore: u.readinessScore,
    }))
    .filter((match) => match.sharedInterests.length > 0)
    .sort(
      (a, b) =>
        b.sharedInterests.length - a.sharedInterests.length ||
        Math.abs(user.readinessScore - a.readinessScore) -
          Math.abs(user.readinessScore - b.readinessScore)
    )

  res.json(matches)
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
