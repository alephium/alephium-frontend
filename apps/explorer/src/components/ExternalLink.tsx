import { ComponentPropsWithoutRef } from 'react'

const ExternalLink = ({ children, ...props }: ComponentPropsWithoutRef<'a'>) => (
  <a {...props} rel="nofollow noopener noreferrer" target="_blank">
    {children}
  </a>
)

export default ExternalLink
