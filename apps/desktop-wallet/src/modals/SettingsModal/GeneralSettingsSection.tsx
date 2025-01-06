import { Currency, fiatCurrencyChanged } from '@alephium/shared'
import { AlertTriangle, Eraser, Info } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import queryClient from '@/api/queryClient'
import ActionLink from '@/components/ActionLink'
import Box from '@/components/Box'
import Button from '@/components/Button'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import KeyValueInput from '@/components/Inputs/InlineLabelValueInput'
import Select from '@/components/Inputs/Select'
import Toggle from '@/components/Inputs/Toggle'
import AnalyticsStorage from '@/features/analytics/analyticsPersistentStorage'
import useAnalytics from '@/features/analytics/useAnalytics'
import { openModal } from '@/features/modals/modalActions'
import RegionSettings from '@/features/settings/RegionSettings'
import {
  analyticsToggled,
  discreetModeToggled,
  languageChanged,
  passwordRequirementToggled,
  walletLockTimeChanged
} from '@/features/settings/settingsActions'
import { fiatCurrencyOptions, languageOptions, locktimeInMinutes } from '@/features/settings/settingsConstants'
import { Language } from '@/features/settings/settingsTypes'
import { ThemeSettings } from '@/features/theme/themeTypes'
import { switchTheme } from '@/features/theme/themeUtils'
import { deleteThumbnailsDB } from '@/features/thumbnails/thumbnailStorage'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'
import {
  appDataCleared,
  appDataClearFailed,
  walletConnectCacheCleared,
  walletConnectCacheClearFailed
} from '@/storage/global/globalActions'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

interface GeneralSettingsSectionProps {
  className?: string
}

const GeneralSettingsSection = ({ className }: GeneralSettingsSectionProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { isWalletUnlocked } = useWalletLock()
  const { walletLockTimeInMinutes, discreetMode, passwordRequirement, language, theme, analytics, fiatCurrency } =
    useAppSelector((s) => s.settings)
  const posthog = usePostHog()
  const { sendAnalytics } = useAnalytics()
  const { reset } = useWalletConnectContext()

  const onPasswordRequirementChange = useCallback(() => {
    if (passwordRequirement) {
      dispatch(openModal({ name: 'DisablePasswordRequirementModal', props: { focusMode: true } }))
    } else {
      dispatch(passwordRequirementToggled())

      sendAnalytics({ event: 'Enabled password requirement' })
    }
  }, [dispatch, passwordRequirement, sendAnalytics])

  const handleLanguageChange = (language: Language) => {
    dispatch(languageChanged(language))

    sendAnalytics({ event: 'Changed language', props: { language } })
  }

  const handleFiatCurrencyChange = (currency: Currency) => {
    dispatch(fiatCurrencyChanged(currency))

    sendAnalytics({ event: 'Changed fiat currency', props: { currency } })
  }

  const handleDiscreetModeToggle = () => dispatch(discreetModeToggled())

  const handleWalletLockTimeChange = (mins: string) => {
    const time = mins ? parseInt(mins) : null

    dispatch(walletLockTimeChanged(time))

    sendAnalytics({ event: 'Changed wallet lock time', props: { time } })
  }

  const handleThemeSelect = (theme: ThemeSettings) => {
    switchTheme(theme)

    sendAnalytics({ event: 'Changed theme', props: { theme } })
  }

  const handleAnalyticsToggle = (toggle: boolean) => {
    dispatch(analyticsToggled(toggle))

    if (posthog.__loaded)
      if (toggle && !import.meta.env.DEV) {
        const id = AnalyticsStorage.load()
        posthog.identify(id)
        posthog.opt_in_capturing()
        posthog.capture('Enabled analytics')
      } else {
        posthog.capture('Disabled analytics')
        posthog.opt_out_capturing()
      }
  }

  const handleClearCacheButtonPress = async () => {
    try {
      queryClient.clear()
      dispatch(appDataCleared())
    } catch (e) {
      dispatch(appDataClearFailed())
      console.error(e)
    }
    try {
      await reset()
      dispatch(walletConnectCacheCleared())
    } catch (e) {
      dispatch(walletConnectCacheClearFailed())
      console.error(e)
    }

    try {
      deleteThumbnailsDB()
    } catch (e) {
      console.error(e)
    }
  }

  const discreetModeText = t('Discreet mode')

  const themeOptions = [
    { label: t('System'), value: 'system' as ThemeSettings },
    { label: t('Light'), value: 'light' as ThemeSettings },
    { label: t('Dark'), value: 'dark' as ThemeSettings }
  ]

  // Make sure to find the closest available locktime if the previous one was set before using a Select component.
  const currentLockTime = walletLockTimeInMinutes
    ? locktimeInMinutes.reduce((prev, curr) =>
        Math.abs(curr - walletLockTimeInMinutes) < Math.abs(prev - walletLockTimeInMinutes) ? curr : prev
      )
    : 0

  return (
    <Box className={className}>
      <KeyValueInput
        label={t('Lock time')}
        description={t('Duration in minutes after which an idle wallet will lock automatically.')}
        InputComponent={
          <Select
            id="wallet-lock-time-in-minutes"
            options={locktimeInMinutes.map((v) => ({
              label: v ? `${v} ${t('Minutes')}` : t('Off'),
              value: v.toString()
            }))}
            onSelect={handleWalletLockTimeChange}
            controlledValue={{
              value: currentLockTime?.toString() || '',
              label: currentLockTime ? `${currentLockTime} ${t('Minutes')}` : t('Off')
            }}
            noMargin
            title={t('Lock time')}
            heightSize="small"
          />
        }
      />
      <HorizontalDivider />
      <KeyValueInput
        label={t('Theme')}
        description={t('Select the theme and please your eyes.')}
        InputComponent={
          <Select
            id="theme"
            options={themeOptions}
            onSelect={handleThemeSelect}
            controlledValue={themeOptions.find((l) => l.value === theme)}
            noMargin
            title={t('Theme')}
            heightSize="small"
          />
        }
      />
      <HorizontalDivider />
      <KeyValueInput
        label={discreetModeText}
        description={t('Toggle discreet mode (hide amounts).')}
        InputComponent={<Toggle label={discreetModeText} toggled={discreetMode} onToggle={handleDiscreetModeToggle} />}
      />
      <HorizontalDivider />
      {isWalletUnlocked && (
        <>
          <KeyValueInput
            label={t('Password requirement')}
            description={t('Require password confirmation before sending each transaction.')}
            InputComponent={<Toggle toggled={passwordRequirement} onToggle={onPasswordRequirementChange} />}
          />
          <HorizontalDivider />
        </>
      )}
      <KeyValueInput
        label="Language"
        description={t('Change the wallet language.')}
        InputComponent={
          <Select
            id="language"
            options={languageOptions}
            onSelect={handleLanguageChange}
            controlledValue={languageOptions.find((l) => l.value === language)}
            noMargin
            title={t('Language')}
            heightSize="small"
          />
        }
      >
        {language !== 'en-US' && (
          <div>
            <Disclaimer
              data-tooltip-html={t(
                'The wallet is developed in English.<br />Translations in other languages are provided by the Alephium community.<br />In case of doubt, always refer to the English version.'
              )}
              data-tooltip-id="default"
            >
              <AlertTriangle size={12} /> <span>{t('Disclaimer')}</span>
            </Disclaimer>
          </div>
        )}
      </KeyValueInput>
      <HorizontalDivider />
      <KeyValueInput
        label={t('Currency')}
        description={t('Change the currency to use to display amounts.')}
        InputComponent={
          <Select
            id="fiat-currency"
            options={fiatCurrencyOptions}
            onSelect={handleFiatCurrencyChange}
            controlledValue={fiatCurrencyOptions.find((l) => l.value === fiatCurrency)}
            noMargin
            title={t('Currency')}
            heightSize="small"
          />
        }
      />
      <HorizontalDivider />

      <RegionSettings />

      <HorizontalDivider />
      <KeyValueInput
        label={t('Analytics')}
        description={t('Help us improve your experience!')}
        InputComponent={<Toggle toggled={analytics} onToggle={handleAnalyticsToggle} />}
      >
        <ActionLink onClick={() => openInWebBrowser(links.analytics)}>
          <MoreInfoLinkContent>
            <Info size={12} />
            <span>{t('More info')}</span>
          </MoreInfoLinkContent>
        </ActionLink>
      </KeyValueInput>
      <HorizontalDivider />
      <KeyValueInput
        label={t('Clear cache')}
        description={t('Deletes cached wallet and WalletConnect data.')}
        InputComponent={
          <ButtonStyled role="secondary" Icon={Eraser} wide onClick={handleClearCacheButtonPress}>
            {t('Clear')}
          </ButtonStyled>
        }
      />
    </Box>
  )
}

export default GeneralSettingsSection

const MoreInfoLinkContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
`

const Disclaimer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  color: ${({ theme }) => theme.global.highlight};
`

const ButtonStyled = styled(Button)`
  margin: 0;
`
