import { AddressHash, ONRAMP_TARGET_LOCATION } from '@alephium/shared'
import { memo, useCallback, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import useOnramperUrl from '@/features/buy/useOnramperUrl'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { showToast } from '@/features/toastMessages/toastMessagesActions'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { openInWebBrowser } from '@/utils/misc'

export interface BuyModalProps {
  addressHash: AddressHash
}

// TODO: Support multiple fiat on-ramp provider.
// Use modal to compare fees, and or let user define how much they want to buy

const BuyModal = memo(({ id, addressHash }: ModalBaseProp & BuyModalProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)

  const onRamperUrl = useOnramperUrl(addressHash)

  const handleAcceptDisclaimer = () => {
    window.electron?.app.openOnRampServiceWindow({ url: onRamperUrl, targetLocation: ONRAMP_TARGET_LOCATION })
    setDisclaimerAccepted(true)
  }

  const handleClose = useCallback(() => dispatch(closeModal({ id })), [dispatch, id])

  useEffect(() => {
    const removeListener = window.electron?.app.onOnRampTargetLocationReached(() => {
      dispatch(showToast({ text: t('Purchase done!'), type: 'success', duration: 'short' }))
      navigate('/wallet/activity')
      handleClose()
    })

    return removeListener
  }, [dispatch, handleClose, id, navigate, t])

  return (
    <CenteredModal id={id} title={!disclaimerAccepted ? t('Disclaimer') : t('Buy')} narrow hasFooterButtons>
      <TextContainer>
        {!disclaimerAccepted ? (
          <Trans t={t} i18nKey="onramperDisclaimer">
            You are about to access 3rd party services provided by
            <ActionLinkStyled onClick={() => openInWebBrowser('https://www.onramper.com')}></ActionLinkStyled> through
            an in-app browser. Alephium does not control Onramper's services. Onramper's terms and conditions will
            apply, so please read and understand them before proceeding.
          </Trans>
        ) : (
          t('You can now complete your purchase in the dedicated window!') + ' 🤑'
        )}
      </TextContainer>
      <ModalFooterButtons>
        {!disclaimerAccepted ? (
          <ModalFooterButton onClick={handleAcceptDisclaimer} role="primary" tall>
            {t('Continue')}
          </ModalFooterButton>
        ) : (
          <ModalFooterButton onClick={handleClose} role="secondary" tall>
            {t('Close')}
          </ModalFooterButton>
        )}
      </ModalFooterButtons>
    </CenteredModal>
  )
})

export default BuyModal

const ActionLinkStyled = styled(ActionLink)`
  display: inline;
`

const TextContainer = styled.span`
  font-size: 13px;
  text-align: center;
`
