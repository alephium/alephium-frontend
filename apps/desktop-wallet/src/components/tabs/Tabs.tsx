import { useState } from 'react'

import TableTabBar from '@/components/TableTabBar'
import TabContent from '@/components/tabs/TabContent'
import { TabsProps } from '@/components/tabs/tabsTypes'

const Tabs = <T extends string>({ tabs, className }: TabsProps<T>) => {
  const [currentTab, setCurrentTab] = useState(tabs[0])

  return (
    <div className={className}>
      <TableTabBar items={tabs} onTabChange={setCurrentTab} activeTab={currentTab} />

      {tabs.map(({ value, renderContent }) => (
        <TabContent isActive={currentTab.value === value} key={value} renderContent={renderContent} />
      ))}
    </div>
  )
}

export default Tabs
