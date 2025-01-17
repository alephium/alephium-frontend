export type DApp = {
  name: string
  description: string
  short_description: string
  tags: string[]
  contracts: {
    name: string
    address: string
  }[]
  audits: string[]
  verified: boolean
  councils_choice: boolean
  dotw: boolean
  links: {
    website: string
    careers: string
    twitter: string
    telegram: string
    discord: string
    github: string
    youtube: string
    medium: string
    mirror: string
  }
  twitterName: string
  teamInfo: {
    contactEmail: string
    founded: string
    anonymous: boolean
  }
  tokens: string[]
  media: {
    logoUrl: string
    bannerUrl: string
    previewUrl: string
    videoUrl: string
  }
}
