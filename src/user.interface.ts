export interface IUser {
  id: string
  name: string
  interests: string[]
  readinessScore: number
  gender: 'male' | 'female' | 'non-binary'
  sexualOrientation: 'heterosexual' | 'homosexual' | 'bisexual'
}
