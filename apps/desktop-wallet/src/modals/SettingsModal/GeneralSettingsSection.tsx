import { Currency, fiatCurrencyChanged } from '@alephium/shared'
import { AlertTriangle, Eraser, Info } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import queryClient from '@/api/queryClient'
import ActionLink from '@/components/ActionLink'
import Button from '@/components/Button'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import KeyValueInput from '@/components/Inputs/InlineLabelValueInput'
import Select from '@/components/Inputs/Select'
import Toggle from '@/components/Inputs/Toggle'
import AnalyticsStorage from '@/features/analytics/analyticsPersistentStorage'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { Language, languageOptions } from '@/features/localization/languages'
import { languageChanged } from '@/features/localization/localizationActions'
import { openModal } from '@/features/modals/modalActions'
import RegionSettings from '@/features/settings/RegionSettings'
import {
  analyticsToggled,
  discreetModeToggled,
  passwordRequirementToggled,
  walletLockTimeChanged
} from '@/features/settings/settingsActions'
import { fiatCurrencyOptions, locktimeInMinutes } from '@/features/settings/settingsConstants'
import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
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
  const passwordRequirement = useAppSelector(selectEffectivePasswordRequirement)
  const walletLockTimeInMinutes = useAppSelector((s) => s.settings.walletLockTimeInMinutes)
  const discreetMode = useAppSelector((s) => s.settings.discreetMode)
  const language = useAppSelector((s) => s.settings.language)
  const theme = useAppSelector((s) => s.settings.theme)
  const analytics = useAppSelector((s) => s.settings.analytics)
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const posthog = usePostHog()
  const { sendAnalytics } = useAnalytics()
  const { reset } = useWalletConnectContext()
  const { isLedger } = useLedger()

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
    <>
      <KeyValueInput
        label={t('Lock time')}
        description={t('Duration in minutes after which an idle wallet will lock automatically.')}
        noTopPadding
        noHorizontalPadding
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
            heightSize="small"
            title={t('Lock time')}
          />
        }
      />
      <HorizontalDivider secondary />
      <KeyValueInput
        label={t('Theme')}
        description={t('Select the theme and please your eyes.')}
        noHorizontalPadding
        InputComponent={
          <Select
            id="theme"
            options={themeOptions}
            onSelect={handleThemeSelect}
            controlledValue={themeOptions.find((l) => l.value === theme)}
            noMargin
            heightSize="small"
            title={t('Theme')}
          />
        }
      />
      <HorizontalDivider secondary />
      <KeyValueInput
        label={discreetModeText}
        description={t('Toggle discreet mode (hide amounts).')}
        noHorizontalPadding
        InputComponent={<Toggle label={discreetModeText} toggled={discreetMode} onToggle={handleDiscreetModeToggle} />}
      />
      <HorizontalDivider secondary />
      {isWalletUnlocked && !isLedger && (
        <>
          <KeyValueInput
            label={t('Password requirement')}
            description={t('Require password confirmation before sending each transaction.')}
            noHorizontalPadding
            InputComponent={<Toggle toggled={passwordRequirement} onToggle={onPasswordRequirementChange} />}
          />
          <HorizontalDivider secondary />
        </>
      )}
      <KeyValueInput
        label="Language"
        description={t('Change the wallet language.')}
        noHorizontalPadding
        InputComponent={
          <Select
            id="language"
            options={languageOptions}
            onSelect={handleLanguageChange}
            controlledValue={languageOptions.find((l) => l.value === language)}
            noMargin
            heightSize="small"
            title={t('Language')}
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
      <HorizontalDivider secondary />
      <KeyValueInput
        label={t('Currency')}
        description={t('Change the currency to use to display amounts.')}
        noHorizontalPadding
        InputComponent={
          <Select
            id="fiat-currency"
            options={fiatCurrencyOptions}
            onSelect={handleFiatCurrencyChange}
            controlledValue={fiatCurrencyOptions.find((l) => l.value === fiatCurrency)}
            noMargin
            heightSize="small"
            title={t('Currency')}
          />
        }
      />
      <HorizontalDivider secondary />

      <RegionSettings />

      <HorizontalDivider secondary />
      <KeyValueInput
        label={t('Analytics')}
        description={t('Help us improve your experience!')}
        noHorizontalPadding
        InputComponent={<Toggle toggled={analytics} onToggle={handleAnalyticsToggle} />}
      >
        <ActionLink onClick={() => openInWebBrowser(links.analytics)}>
          <MoreInfoLinkContent>
            <Info size={12} />
            <span>{t('More info')}</span>
          </MoreInfoLinkContent>
        </ActionLink>
      </KeyValueInput>
      <HorizontalDivider secondary />
      <KeyValueInput
        label={t('Clear cache')}
        description={t('Deletes cached wallet and WalletConnect data.')}
        noBottomPadding
        noHorizontalPadding
        InputComponent={
          <ButtonStyled role="secondary" Icon={Eraser} wide onClick={handleClearCacheButtonPress} short>
            {t('Clear')}
          </ButtonStyled>
        }
      />
    </>
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
