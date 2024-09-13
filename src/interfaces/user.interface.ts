import { Gender } from '../gender.type'

export interface IUser {
  id: string
  name: string
  interests: string[]
  readinessScore: number
  gender: Gender
  genderPreference: Gender[]
  height: number
}
