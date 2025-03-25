import { useState } from 'react'

import TableTabBar from '@/components/TableTabBar'
import TabContent from '@/components/tabs/TabContent'
import { TabsProps } from '@/components/tabs/tabsTypes'

const Tabs = <T extends string>({ tabs }: TabsProps<T>) => {
  const [currentTab, setCurrentTab] = useState(tabs[0])
  const [mouseOverTab, setMouseOverTab] = useState<T | null>(null)

  const onMouseOverTabBar = (tabValue: T) => setMouseOverTab(tabValue)
  const onMouseLeaveTabBar = () => setMouseOverTab(null)

  return (
    <>
      <TableTabBar
        items={tabs}
        onTabChange={setCurrentTab}
        activeTab={currentTab}
        onMouseOverTabBar={onMouseOverTabBar}
        onMouseLeaveTabBar={onMouseLeaveTabBar}
      />

      {tabs.map(({ value, renderContent }) => (
        <TabContent
          isActive={currentTab.value === value}
          key={value}
          renderContent={renderContent}
          isMouseOverTab={mouseOverTab === value}
        />
      ))}
    </>
  )
}

export default Tabs
