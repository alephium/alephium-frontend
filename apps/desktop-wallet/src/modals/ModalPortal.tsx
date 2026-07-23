import { AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import Tooltips from '@/components/Tooltips'

const ModalPortal = ({ children }: { children?: ReactNode }) =>
  createPortal(
    <>
      <AnimatePresence>{children}</AnimatePresence>
      <Tooltips />
    </>,
    document.body
  )

export default ModalPortal
