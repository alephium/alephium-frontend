import { transactionSent } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import {
  binToHex,
  contractIdFromAddress,
  node as n,
  SignDeployContractTxParams,
  SignDeployContractTxResult
} from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Image } from 'react-native'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import { signAndSendTransaction } from '~/api/transactions'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import CopyBytecodeRow from '~/features/ecosystem/modals/CopyBytecodeRow'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import FeeAmounts from '~/features/send/screens/FeeAmounts'
import { useAppDispatch } from '~/hooks/redux'

interface SignDeployContractTxModalProps {
  txParams: SignDeployContractTxParams
  unsignedData: n.BuildDeployContractTxResult
  onError: (message: string) => void
  onSuccess: (signResult: SignDeployContractTxResult) => void
  onReject: () => void
  origin: 'walletconnect' | 'in-app-browser'
  dAppUrl?: string
  dAppIcon?: string
}

const SignDeployContractTxModal = memo(
  ({
    id,
    txParams,
    unsignedData,
    dAppUrl,
    dAppIcon,
    origin,
    onError,
    onReject,
    onSuccess
  }: SignDeployContractTxModalProps & ModalBaseProp) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const { handleApprovePress, handleRejectPress, onDismiss, fees } = useSignModal({
      id,
      onReject,
      onError,
      unsignedData,
      sendTransaction: async () => {
        const data = await signAndSendTransaction(txParams.signerAddress, unsignedData.txId, unsignedData.unsignedTx)

        dispatch(
          transactionSent({
            hash: data.txId,
            fromAddress: txParams.signerAddress,
            timestamp: new Date().getTime(),
            status: 'sent',
            type: 'contract',
            toAddress: ''
          })
        )

        sendAnalytics({ event: 'Approved contract deployment', props: { origin } })

        onSuccess({
          groupIndex: unsignedData.fromGroup,
          unsignedTx: unsignedData.unsignedTx,
          txId: unsignedData.txId,
          signature: data.signature,
          contractAddress: unsignedData.contractAddress,
          contractId: binToHex(contractIdFromAddress(unsignedData.contractAddress)),
          gasAmount: unsignedData.gasAmount,
          gasPrice: BigInt(unsignedData.gasPrice)
        })
      }
    })

    return (
      <BottomModal2 onDismiss={onDismiss} modalId={id} contentVerticalGap>
        <ScreenSection>
          <Surface>
            <Row title={t('From')} titleColor="secondary">
              <AddressBadge addressHash={txParams.signerAddress} />
            </Row>

            {dAppUrl && (
              <Row title={t('To')} titleColor="secondary" noMaxWidth>
                {dAppIcon && <DAppIcon source={{ uri: dAppIcon }} />}
                <AppText semiBold>{dAppUrl}</AppText>
              </Row>
            )}

            {!!txParams.initialAttoAlphAmount && (
              <Row title={t('Initial amount')} titleColor="secondary">
                <AssetAmountWithLogo assetId={ALPH.id} amount={BigInt(txParams.initialAttoAlphAmount)} fullPrecision />
              </Row>
            )}

            {!!txParams.issueTokenAmount && (
              <Row title={t('Issue token amount')} titleColor="secondary">
                <AppText>{txParams.issueTokenAmount.toString()}</AppText>
              </Row>
            )}

            <CopyBytecodeRow bytecode={txParams.bytecode} />

            {fees !== undefined && (
              <Row title={t('Estimated fees')} titleColor="secondary" isLast>
                <FeeAmounts fees={fees} />
              </Row>
            )}
          </Surface>
        </ScreenSection>
        <ScreenSection centered>
          <ButtonsRow>
            <Button title={t('Reject')} variant="alert" onPress={handleRejectPress} flex />
            <Button title={t('Approve')} variant="valid" onPress={handleApprovePress} flex />
          </ButtonsRow>
        </ScreenSection>
      </BottomModal2>
    )
  }
)

export default SignDeployContractTxModal

const DAppIcon = styled(Image)`
  width: 20px;
  height: 20px;
`
