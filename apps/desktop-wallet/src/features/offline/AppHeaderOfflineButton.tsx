import { useIsExplorerOffline, useIsNodeOffline } from '@alephium/shared-react'
import { WifiOff } from 'lucide-react'
import { useTheme } from 'styled-components'

import Button from '@/components/Button'
import VerticalDivider from '@/components/PageComponents/VerticalDivider'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'

const AppHeaderOfflineButton = () => {
  const isNodeOffline = useIsNodeOffline()
  const isExplorerOffline = useIsExplorerOffline()
  const dispatch = useAppDispatch()
  const theme = useTheme()

  const openOfflineModal = () => dispatch(openModal({ name: 'OfflineModal' }))

  if (!isNodeOffline && !isExplorerOffline) return null

  const bothOffline = isNodeOffline && isExplorerOffline

  return (
    <>
      <Button
        Icon={WifiOff}
        circle
        short
        role="secondary"
        variant={bothOffline ? 'alert' : 'default'}
        transparent={bothOffline ? undefined : true}
        onClick={openOfflineModal}
        squared
        iconColor={bothOffline ? undefined : theme.global.highlight}
      />
      <VerticalDivider />
    </>
  )
}

export default AppHeaderOfflineButton
