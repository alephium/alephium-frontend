import { ComponentType, memo } from 'react'

import { ModalBaseProp } from './modalTypes'

const withModal = <P extends object>(Component: ComponentType<ModalBaseProp & P>) => {
  const WrappedComponent = (props: ModalBaseProp & P) => {
    if (!props.id) {
      throw new Error("The 'id' prop is required for all modals")
    }
    return <Component {...props} />
  }

  return memo(WrappedComponent)
}

export default withModal
