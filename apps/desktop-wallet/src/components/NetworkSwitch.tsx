/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { NetworkName, NetworkNames, networkPresetSwitched, networkSettingsPresets } from '@alephium/shared'
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
  )
}

export default NetworkSwitch

const SelectCustomComponent = () => {
  const theme = useTheme()
  const network = useAppSelector((state) => state.network)

  const networkStatusColor = {
    online: theme.global.valid,
    offline: theme.global.alert,
    connecting: theme.global.accent,
    uninitialized: theme.font.tertiary
  }[network.status]

  return (
    <Button
      role="secondary"
      transparent
      circle
      data-tooltip-id="default"
      data-tooltip-content={network.name}
      tiny
      Icon={Dot}
      iconSize={50}
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
