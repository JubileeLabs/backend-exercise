import { IUser } from './user.interface'

export interface IMatch {
  user1: IUser
  user2: IUser
  sharedInterests: string[]
  interestCount: number
  readinessScoreDifference: number
}
