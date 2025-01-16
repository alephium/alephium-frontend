import { AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

import Tooltips from '@/components/Tooltips'

const ModalPortal: FC = ({ children }) =>
  createPortal(
    <>
      <AnimatePresence>{children}</AnimatePresence>
      <Tooltips />
    </>,
    document.body
  )

export default ModalPortal
