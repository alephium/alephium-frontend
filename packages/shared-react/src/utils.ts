import { isValidElement, memo, ReactElement } from 'react'

const memoizedFn = memo(() => null)

export const isElementMemoized = <P>(element: ReactElement<P>): boolean => {
  if (!isValidElement(element)) return false

  const elementType = element.type as unknown as { $$typeof?: symbol }

  return !!elementType.$$typeof && elementType.$$typeof === (memoizedFn as unknown as { $$typeof: symbol }).$$typeof
}

export const getElementName = <P>(element: ReactElement<P>): string => {
  const elementType = element.type as React.ComponentType<P>

  return elementType.displayName || elementType.name || 'Component'
}
