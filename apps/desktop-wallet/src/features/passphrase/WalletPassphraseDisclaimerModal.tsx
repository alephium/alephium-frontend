import { t } from 'i18next'
import { memo, useState } from 'react'
import { Trans } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import InfoBox from '@/components/InfoBox'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

export interface WalletPassphraseDisclaimerModalProps {
  onConsentChange: (consent: boolean) => void
}

const WalletPassphraseDisclaimerModal = memo(
  ({ id, onConsentChange }: WalletPassphraseDisclaimerModalProps & ModalBaseProp) => {
    const dispatch = useAppDispatch()
    const [isConsentActive, setIsConsentActive] = useState(false)

    const handleClose = () => {
      onConsentChange(isConsentActive)
      dispatch(closeModal({ id }))
    }

    return (
      <CenteredModal id={id} title={t('Passphrase warning')} hasFooterButtons>
        <InfoBox importance="alert">
          <p>
            <Trans t={t} i18nKey="passphraseWarningMessage">
              <WarningEmphasis>This is an advanced feature!</WarningEmphasis>
              <br />
              Use it only if you know what you are doing.
              <br />
              Please, read our <ActionLink onClick={() => openInWebBrowser(links.passphrase)}>documentation</ActionLink>
              to learn about it.
            </Trans>
          </p>
        </InfoBox>
        <ConsentCheckbox>
          <input
            type="checkbox"
            id="passphrase-consent"
            checked={isConsentActive}
            onChange={() => setIsConsentActive(!isConsentActive)}
          />
          <label htmlFor="passphrase-consent">{t('I have read and understood the documentation')}</label>
        </ConsentCheckbox>

        <ModalFooterButtons>
          <ModalFooterButton disabled={!isConsentActive} onClick={handleClose} role="primary" tall>
            {t('Continue')}
          </ModalFooterButton>
        </ModalFooterButtons>
      </CenteredModal>
    )
  }
)

export default WalletPassphraseDisclaimerModal

const WarningEmphasis = styled.strong`
  color: ${({ theme }) => theme.global.alert};
`

const ConsentCheckbox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-bottom: 16px;
  text-align: left;
`
