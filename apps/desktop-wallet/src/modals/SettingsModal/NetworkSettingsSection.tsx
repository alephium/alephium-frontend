import {
  customNetworkSettingsSaved,
  getNetworkName,
  NetworkName,
  NetworkNames,
  networkPresetSwitched,
  NetworkSettings,
  networkSettingsPresets,
  throttledClient
} from '@alephium/shared'
import { AlertOctagon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Badge from '@/components/Badge'
import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import Input from '@/components/Inputs/Input'
import Select from '@/components/Inputs/Select'
import { Section } from '@/components/PageComponents/PageContainers'
import ToggleSection from '@/components/ToggleSection'
import useAnalytics from '@/features/analytics/useAnalytics'
import i18next from '@/features/localization/i18n'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useMountEffect } from '@/utils/hooks'

interface NetworkSelectOption {
  label: string
  value: NetworkName
}

const networkSelectOptions: NetworkSelectOption[] = Object.values(NetworkNames).map((networkName) => ({
  label: {
    mainnet: i18next.t('Mainnet'),
    testnet: i18next.t('Testnet'),
    devnet: i18next.t('Devnet'),
    custom: i18next.t('Custom')
  }[networkName],
  value: networkName
}))

const NetworkSettingsSection = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const network = useAppSelector((state) => state.network)
  const { sendAnalytics } = useAnalytics()
  const theme = useTheme()

  const [tempNetworkSettings, setTempNetworkSettings] = useState<NetworkSettings>(network.settings)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkName>()

  const [advancedSectionOpen, setAdvancedSectionOpen] = useState(false)

  const overrideSelectionIfMatchesPreset = useCallback((newSettings: NetworkSettings) => {
    // Check if values correspond to an existing preset
    const newNetwork = getNetworkName(newSettings)

    setSelectedNetwork(newNetwork)
  }, [])

  const editNetworkSettings = (v: Partial<NetworkSettings>) => {
    const newSettings = { ...tempNetworkSettings, ...v }

    // Check if we need to append the http:// protocol if an IP or localhost is used
    if (v.nodeHost?.match(/^(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|localhost)(?::[0-9]*)?$/)) {
      newSettings.nodeHost = `http://${v.nodeHost}`
    }

    overrideSelectionIfMatchesPreset(newSettings)

    setTempNetworkSettings(newSettings)
  }

  useEffect(() => {
    if (network.name === 'custom' || network.settings.proxy?.address) {
      setAdvancedSectionOpen(true)
    }
  }, [network.name, network.settings.proxy])

  const handleNetworkPresetChange = useCallback(
    async (networkName: NetworkName) => {
      if (networkName !== selectedNetwork) {
        setSelectedNetwork(networkName)

        if (networkName === 'custom') {
          setAdvancedSectionOpen(true)
          return
        }

        setAdvancedSectionOpen(false)

        const newNetworkSettings = networkSettingsPresets[networkName]

        let networkId = newNetworkSettings.networkId

        if (networkId !== undefined) {
          dispatch(networkPresetSwitched(networkName))
          setTempNetworkSettings(newNetworkSettings)

          sendAnalytics({ event: 'Changed network', props: { network_name: networkName } })
          return
        }

        if (networkId === undefined) {
          const response = await throttledClient.node.infos.getInfosChainParams()
          networkId = response.networkId
        }

        if (networkId !== undefined) {
          const settings = { ...newNetworkSettings, networkId: networkId }
          dispatch(customNetworkSettingsSaved(settings))
          setTempNetworkSettings(settings)

          sendAnalytics({ event: 'Saved custom network settings' })
        }
      }
    },
    [dispatch, selectedNetwork, sendAnalytics]
  )

  const handleAdvancedSettingsSave = useCallback(() => {
    if (
      selectedNetwork !== 'custom' &&
      (selectedNetwork === network.name || getNetworkName(tempNetworkSettings) === network.name)
    ) {
      setSelectedNetwork(network.name)
    }

    overrideSelectionIfMatchesPreset(tempNetworkSettings)
    dispatch(customNetworkSettingsSaved(tempNetworkSettings))

    // Proxy settings (no need to be awaited)
    if (tempNetworkSettings.proxy) window.electron?.app.setProxySettings(tempNetworkSettings.proxy)

    sendAnalytics({ event: 'Saved custom network settings' })
  }, [dispatch, network.name, overrideSelectionIfMatchesPreset, selectedNetwork, sendAnalytics, tempNetworkSettings])

  // Set existing value on mount
  useMountEffect(() => {
    overrideSelectionIfMatchesPreset(network.settings)
  })

  return (
    <>
      <StyledInfoBox
        Icon={AlertOctagon}
        text={t('Make sure to always check what is the selected network before sending transactions.')}
        importance="accent"
      />
      <Select
        options={networkSelectOptions}
        onSelect={handleNetworkPresetChange}
        controlledValue={networkSelectOptions.find((n) => n.value === selectedNetwork)}
        title={t('Network')}
        label={t('Current network')}
        id="network"
      />
      <ToggleSection
        title={t('Advanced settings')}
        subtitle={t('Set custom network URLs')}
        isOpen={advancedSectionOpen}
        onClick={(isOpen) => setAdvancedSectionOpen(isOpen)}
      >
        <UrlInputs>
          <h2 tabIndex={0} role="label">
            {t("Alephium's services")}
          </h2>
          <Input
            id="node-host"
            label={t('Node host')}
            value={tempNetworkSettings.nodeHost}
            onChange={(e) => editNetworkSettings({ nodeHost: e.target.value })}
            noMargin
          />
          <Input
            id="explorer-api-host"
            label={t('Explorer API host')}
            value={tempNetworkSettings.explorerApiHost}
            onChange={(e) => editNetworkSettings({ explorerApiHost: e.target.value })}
            noMargin
          />
          <Input
            id="explorer-url"
            label={t('Explorer URL')}
            value={tempNetworkSettings.explorerUrl}
            onChange={(e) => editNetworkSettings({ explorerUrl: e.target.value })}
            noMargin
          />
          <h2 tabIndex={0} role="label">
            {t('Custom proxy (SOCKS5)')}
            <ExperimentalBadge color={theme.global.accent} compact>
              {t('Experimental')}
            </ExperimentalBadge>
          </h2>
          <Input
            id="proxy-address"
            label={t('Proxy address')}
            value={tempNetworkSettings.proxy?.address}
            onChange={(e) => editNetworkSettings({ proxy: { ...tempNetworkSettings.proxy, address: e.target.value } })}
            noMargin
          />
          <Input
            id="proxy-port"
            label={t('Proxy port')}
            value={tempNetworkSettings.proxy?.port}
            onChange={(e) => editNetworkSettings({ proxy: { ...tempNetworkSettings.proxy, port: e.target.value } })}
            noMargin
          />
        </UrlInputs>
        <Section inList>
          <Button onClick={handleAdvancedSettingsSave}>{t('Save')}</Button>
        </Section>
      </ToggleSection>
    </>
  )
}

const UrlInputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const StyledInfoBox = styled(InfoBox)`
  margin-top: 0;
`

const ExperimentalBadge = styled(Badge)`
  margin-left: var(--spacing-2);
`

export default NetworkSettingsSection
