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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import SpinnerModal from '~/components/SpinnerModal'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { showToast } from '~/utils/layout'

const WalletConnectPasteUrlModal = (props: ModalContentProps) => {
  const { pairWithDapp } = useWalletConnectContext()
  const { t } = useTranslation()

  const [inputWcUrl, setInputWcUrl] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (url: string) => {
    setError(!url.startsWith('wc:') ? t('This is not a valid WalletConnect URI') : '')
    setInputWcUrl(url)
  }

  const handleConnect = async () => {
    if (inputWcUrl.startsWith('wc:')) {
      setIsLoading(true)

      await pairWithDapp(inputWcUrl)

      setIsLoading(false)

      props.onClose && props.onClose()
      sendAnalytics({ event: 'WC: Connected by manually pasting URI' })
    } else {
      showToast({
        text1: 'Invalid URI',
        text2: t('This is not a valid WalletConnect URI') + ': ' + inputWcUrl,
        type: 'error'
      })
    }
  }

  return (
    <>
      <ModalContent verticalGap {...props}>
        <ScreenSection>
          <BottomModalScreenTitle>{t('Connect to dApp')}</BottomModalScreenTitle>
        </ScreenSection>
        <ScreenSection>
          <AppText color="secondary" size={18}>
            {t('Paste the WalletConnect URI you copied from the dApp')}:
          </AppText>
        </ScreenSection>
        <ScreenSection>
          <Input label={t('WalletConnect URI')} value={inputWcUrl} onChangeText={handleInputChange} error={error} />
        </ScreenSection>
        <ScreenSection>
          <Button title={t('Connect')} variant="highlight" onPress={handleConnect} disabled={!inputWcUrl || !!error} />
        </ScreenSection>
      </ModalContent>
      <SpinnerModal isActive={isLoading} />
    </>
  )
}

export default WalletConnectPasteUrlModal
