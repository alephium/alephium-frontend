import { motion } from 'framer-motion'
import styled from 'styled-components'

export default styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;

  height: 50px;

  color: var(--color-white);
  background-color: ${({ theme }) => theme.global.accent};
`
