import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

export interface TabItemSimple<T extends string> {
  value: T
  label: string
  Icon?: LucideIcon
}

export interface TabItem<T extends string> extends TabItemSimple<T> {
  renderContent: () => ReactNode
}

export interface TabsProps<T extends string> {
  tabs: TabItem<T>[]
  className?: string
}
