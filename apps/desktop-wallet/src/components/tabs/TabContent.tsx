import { motion } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'
import { Freeze } from 'react-freeze'
import styled from 'styled-components'

import { fastTransition } from '@/animations'
import { TabItem } from '@/components/tabs/tabsTypes'

interface TabContentProps<T extends string> extends Pick<TabItem<T>, 'renderContent'> {
  isActive: boolean
  isMouseOverTabHeaders: boolean
}

const TabContent = <T extends string>({ isActive, renderContent, isMouseOverTabHeaders }: TabContentProps<T>) => {
  const isFrozen = !isActive && !isMouseOverTabHeaders

  return (
    <TabAnimation animate={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 1 : 0 }} {...fastTransition}>
      <Freeze freeze={isFrozen}>
        <TabContainer isActive={isActive}>{renderContent()}</TabContainer>
      </Freeze>
    </TabAnimation>
  )
}

export default TabContent

interface TabTabContainerProps<T extends string> extends Pick<TabContentProps<T>, 'isActive'> {
  children: ReactNode
}

const TabContainer = <T extends string>({ children, isActive }: TabTabContainerProps<T>) => {
  const [shouldRender, setShouldRender] = useState(isActive)

  useEffect(() => {
    if (isActive) setShouldRender(true)
  }, [isActive])

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
