import { WifiOff } from 'lucide-react'
import { useTheme } from 'styled-components'

import Button from '@/components/Button'
import VerticalDivider from '@/components/PageComponents/VerticalDivider'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

const AppHeaderOfflineButton = () => {
  const nodeStatus = useAppSelector((s) => s.network.nodeStatus)
  const explorerStatus = useAppSelector((s) => s.network.explorerStatus)
  const dispatch = useAppDispatch()
  const theme = useTheme()

  const openOfflineModal = () => dispatch(openModal({ name: 'OfflineModal' }))

  if (nodeStatus !== 'offline' && explorerStatus !== 'offline') return null

  return (
    <>
      <Button
        Icon={WifiOff}
        circle
        short
        role="secondary"
        variant={explorerStatus === 'offline' && nodeStatus === 'offline' ? 'alert' : 'default'}
        transparent={explorerStatus === 'offline' && nodeStatus === 'offline' ? undefined : true}
        onClick={openOfflineModal}
        squared
        iconColor={explorerStatus === 'offline' && nodeStatus === 'offline' ? undefined : theme.global.highlight}
      />
      <VerticalDivider />
    </>
  )
}

export default AppHeaderOfflineButton
