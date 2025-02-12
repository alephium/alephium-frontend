import { motion } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'
import styled from 'styled-components'

import { fastTransition } from '@/animations'
import { TabItem } from '@/components/tabs/tabsTypes'

interface TabContentProps<T extends string> extends Pick<TabItem<T>, 'renderContent'> {
  isActive: boolean
}

const TabContent = <T extends string>({ isActive, renderContent }: TabContentProps<T>) => (
  <TabAnimation animate={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 1 : 0 }} {...fastTransition}>
    <TabContainer hasBeenVisited={isActive}>{renderContent()}</TabContainer>
  </TabAnimation>
)

export default TabContent

interface TabTabContainerProps {
  hasBeenVisited: boolean
  children: ReactNode
}

const TabContainer = ({ children, hasBeenVisited }: TabTabContainerProps) => {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (hasBeenVisited) setShouldRender(true)
  }, [hasBeenVisited])

  if (!shouldRender) return null

  return <TabContentStyled>{children}</TabContentStyled>
}

const TabAnimation = styled(motion.div)`
  position: relative;
`

const TabContentStyled = styled.div`
  position: absolute;
  width: 100%;
`
