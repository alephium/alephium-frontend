import { NetworkName, NetworkNames, networkPresetSwitched, networkSettingsPresets } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { ArrowRight, Dot } from 'lucide-react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Button from '@/components/Button'
import Select from '@/components/Inputs/Select'
import useAnalytics from '@/features/analytics/useAnalytics'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

interface NetworkSelectOption {
  label: string
  value: NetworkName
}

type NonCustomNetworkName = Exclude<keyof typeof NetworkNames, 'custom'>

const NetworkSwitch = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const network = useAppSelector((state) => state.network)
  const isDevToolsEnabled = useAppSelector((s) => s.settings.devTools)
  const { sendAnalytics } = useAnalytics()

  const excludedNetworks: NetworkName[] = isDevToolsEnabled ? ['custom'] : ['custom', 'devnet']
  const networkNames = Object.values(NetworkNames).filter(
    (n) => !excludedNetworks.includes(n)
  ) as NonCustomNetworkName[]
  const networkSelectOptions: NetworkSelectOption[] = networkNames.map((networkName) => ({
    label: {
      mainnet: t('Mainnet'),
      testnet: t('Testnet'),
      devnet: t('Devnet')
    }[networkName],
    value: networkName
  }))

  const handleNetworkPresetChange = useCallback(
    async (networkName: NetworkName) => {
      if (networkName !== network.name && networkName !== 'custom') {
        const newNetworkSettings = networkSettingsPresets[networkName]
        const networkId = newNetworkSettings.networkId

        if (networkId !== undefined) {
          dispatch(networkPresetSwitched(networkName))

          sendAnalytics({ event: 'Changed network from app header', props: { network_name: networkName } })
          return
        }
      }
    },
    [dispatch, network.name, sendAnalytics]
  )

  const openSettingsModal = () => dispatch(openModal({ name: 'SettingsModal', props: { initialTabValue: 'network' } }))

  const currentNetwork = networkSelectOptions.find((n) => n.value === network.name)

  return (
    <SelectContainer>
      <Select
        options={networkSelectOptions}
        onSelect={handleNetworkPresetChange}
        controlledValue={currentNetwork}
        title={t('Current network')}
        id="network"
        noMargin
        renderCustomComponent={SelectCustomComponent}
        skipEqualityCheck
        heightSize="small"
        ListBottomComponent={
          <MoreOptionsItem onClick={openSettingsModal}>
            {t('More options')} <ArrowRight size={16} />
          </MoreOptionsItem>
        }
      />
    </SelectContainer>
  )
}

export default NetworkSwitch

const SelectCustomComponent = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const network = useAppSelector((state) => state.network)
  const isOffline = useCurrentlyOnlineNetworkId() === undefined

  const networkStatusColor = {
    online: theme.global.valid,
    offline: theme.global.alert,
    connecting: theme.global.accent,
    uninitialized: theme.font.tertiary
  }[network.nodeStatus]

  return (
    <Button
      role="secondary"
      transparent
      circle
      data-tooltip-id="default"
      data-tooltip-content={isOffline ? `${network.name} (${t('offline')})` : network.name}
      tiny
      Icon={Dot}
      iconSize={42}
      iconColor={networkStatusColor}
    />
  )
}

const MoreOptionsItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  gap: 10px;
  color: ${({ theme }) => theme.font.secondary};

  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.font.primary};
  }
`

const SelectContainer = styled.div`
  flex: 0;
`
