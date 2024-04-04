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

import { Currency, fiatCurrencyChanged } from '@alephium/shared'
import { AlertTriangle, Eraser, Info } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import Box from '@/components/Box'
import Button from '@/components/Button'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import KeyValueInput from '@/components/Inputs/InlineLabelValueInput'
import Select from '@/components/Inputs/Select'
import Toggle from '@/components/Inputs/Toggle'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import { useWalletConnectContext } from '@/contexts/walletconnect'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
import ModalPortal from '@/modals/ModalPortal'
import AnalyticsStorage from '@/storage/analytics/analyticsPersistentStorage'
import { walletConnectCacheCleared, walletConnectCacheClearFailed } from '@/storage/global/globalActions'
import {
  analyticsToggled,
  discreetModeToggled,
  languageChanged,
  passwordRequirementToggled,
  walletLockTimeChanged
} from '@/storage/settings/settingsActions'
import { switchTheme } from '@/storage/settings/settingsStorageUtils'
import { Language, ThemeSettings } from '@/types/settings'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'
import { fiatCurrencyOptions, languageOptions, locktimeInMinutes } from '@/utils/settings'

interface GeneralSettingsSectionProps {
  className?: string
}

const GeneralSettingsSection = ({ className }: GeneralSettingsSectionProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((s) => !!s.activeWallet.id)
  const { walletLockTimeInMinutes, discreetMode, passwordRequirement, language, theme, analytics, fiatCurrency } =
    useAppSelector((s) => s.settings)
  const posthog = usePostHog()
  const { reset } = useWalletConnectContext()

  const [isPasswordModelOpen, setIsPasswordModalOpen] = useState(false)

  const onPasswordRequirementChange = useCallback(() => {
    if (passwordRequirement) {
      setIsPasswordModalOpen(true)
    } else {
      dispatch(passwordRequirementToggled())

      posthog.capture('Enabled password requirement')
    }
  }, [dispatch, passwordRequirement, posthog])

  const disablePasswordRequirement = useCallback(() => {
    dispatch(passwordRequirementToggled())
    setIsPasswordModalOpen(false)

    posthog.capture('Disabled password requirement')
  }, [dispatch, posthog])

  const handleLanguageChange = (language: Language) => {
    dispatch(languageChanged(language))

    posthog.capture('Changed language', { language })
  }

  const handleFiatCurrencyChange = (currency: Currency) => {
    dispatch(fiatCurrencyChanged(currency))

    posthog.capture('Changed fiat currency', { currency })
  }

  const handleDiscreetModeToggle = () => dispatch(discreetModeToggled())

  const handleWalletLockTimeChange = (mins: string) => {
    const time = mins ? parseInt(mins) : null

    dispatch(walletLockTimeChanged(time))

    posthog.capture('Changed wallet lock time', { time })
  }

  const handleThemeSelect = (theme: ThemeSettings) => {
    switchTheme(theme)

    posthog.capture('Changed theme', { theme })
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

  const handleClearWCCacheButtonPress = async () => {
    try {
      await reset()
      dispatch(walletConnectCacheCleared())
    } catch (e) {
      dispatch(walletConnectCacheClearFailed())
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
      {isAuthenticated && (
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
        label={t('Language')}
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
      <KeyValueInput
        label={t('Analytics')}
        description={t('Help us improve your experience!')}
        InputComponent={<Toggle toggled={analytics} onToggle={handleAnalyticsToggle} />}
      >
        <ActionLinkStyled onClick={() => openInWebBrowser(links.analytics)}>
          <Info size={12} /> {t('More info')}
        </ActionLinkStyled>
      </KeyValueInput>
      <HorizontalDivider />
      <KeyValueInput
        label={t('Clear WalletConnect cache')}
        description={t('Helps avoid crashes due to WalletConnect')}
        InputComponent={
          <ButtonStyled role="secondary" Icon={Eraser} wide onClick={handleClearWCCacheButtonPress}>
            {t('Clear')}
          </ButtonStyled>
        }
      />
      <ModalPortal>
        {isPasswordModelOpen && (
          <CenteredModal title={t('Password')} onClose={() => setIsPasswordModalOpen(false)} focusMode skipFocusOnMount>
            <PasswordConfirmation
              text={t('Type your password to change this setting.')}
              buttonText={t('Enter')}
              onCorrectPasswordEntered={disablePasswordRequirement}
            />
          </CenteredModal>
        )}
      </ModalPortal>
    </Box>
  )
}

export default GeneralSettingsSection

const ActionLinkStyled = styled(ActionLink)`
  gap: 0.3em;
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
