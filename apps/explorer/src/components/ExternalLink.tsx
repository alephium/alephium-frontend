import { ComponentPropsWithoutRef } from 'react'

const ExternalLink: FC<ComponentPropsWithoutRef<'a'>> = ({ children, ...props }) => (
  <a {...props} rel="nofollow noopener noreferrer" target="_blank">
    {children}
  </a>
)

export default ExternalLink
