import { isValidElement, ReactElement } from 'react'

import withModal from '~/features/modals/withModal'

// TODO: Move those functions to shared react package

const wrappedModalExample = withModal(() => null)

export const isModalWrapped = <P,>(element: ReactElement<P>): boolean => {
  if (!isValidElement(element)) return false

  const elementType = element.type as unknown as { $$typeof?: symbol }

  return (
    !!elementType.$$typeof && elementType.$$typeof === (wrappedModalExample as unknown as { $$typeof: symbol }).$$typeof
  )
}

export const getElementName = <P,>(element: ReactElement<P>): string => {
  const elementType = element.type as React.ComponentType<P>

  return elementType.displayName || elementType.name || 'Component'
}
