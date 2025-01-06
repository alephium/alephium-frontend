export type Announcement = {
  isActive: boolean
  title: string
  description: string
  type: 'info' | 'alert'
  button?: {
    title: string
    link: string
  }
}
