export interface NFTTokenUriMetaData {
  name: string
  description?: string
  image: string
  attributes?: [
    {
      trait_type: string
      value: string | number | boolean
    }
  ]
}

export interface NFTCollectionUriMetaData {
  name: string
  description: string
  image: string
}
