import { motion } from 'framer-motion'
import { memo, useEffect, useState } from 'react'
import { Freeze } from 'react-freeze'
import styled from 'styled-components'

import { fastTransition } from '@/animations'
import { TabItem } from '@/components/tabs/tabsTypes'

interface TabContentProps<T extends string> extends Pick<TabItem<T>, 'renderContent'> {
  isActive: boolean
  isMouseOverTab: boolean
}

const TabContent = <T extends string>({ isActive, renderContent, isMouseOverTab }: TabContentProps<T>) => {
  const isFrozen = !isActive && !isMouseOverTab

  return (
    <TabAnimation
      animate={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 1 : 0, position: isFrozen ? 'absolute' : 'relative' }}
      {...fastTransition}
    >
      <Freeze freeze={isFrozen}>
        <TabContainer isActive={isActive} renderContent={renderContent} />
      </Freeze>
    </TabAnimation>
  )
}

export default TabContent

type TabTabContainerProps<T extends string> = Pick<TabContentProps<T>, 'isActive' | 'renderContent'>

const TabContainer = memo(<T extends string>({ renderContent, isActive }: TabTabContainerProps<T>) => {
  const [shouldRender, setShouldRender] = useState(isActive)

  useEffect(() => {
    if (isActive) setShouldRender(true)
  }, [isActive])

  if (!shouldRender) return null

  return <TabContentStyled>{renderContent()}</TabContentStyled>
})

const TabAnimation = styled(motion.div)`
  position: relative;
`

const TabContentStyled = styled.div`
  position: absolute;
  width: 100%;
`
