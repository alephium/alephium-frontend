import { motion } from 'framer-motion'
import { useState } from 'react'

import TableTabBar from '@/components/TableTabBar'
import TabContent from '@/components/tabs/TabContent'
import { TabsProps } from '@/components/tabs/tabsTypes'

const Tabs = <T extends string>({ tabs }: TabsProps<T>) => {
  const [currentTab, setCurrentTab] = useState(tabs[0])
  const [isMouseOverTabHeaders, setIsMouseOverTabHeaders] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setIsMouseOverTabHeaders(true)}
      onMouseLeave={() => setIsMouseOverTabHeaders(false)}
    >
      <TableTabBar items={tabs} onTabChange={setCurrentTab} activeTab={currentTab} />

      {tabs.map(({ value, renderContent }) => (
        <TabContent
          isActive={currentTab.value === value}
          key={value}
          renderContent={renderContent}
          isMouseOverTabHeaders={isMouseOverTabHeaders}
        />
      ))}
    </motion.div>
  )
}

export default Tabs
