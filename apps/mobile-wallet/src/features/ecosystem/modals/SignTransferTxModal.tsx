import { transactionSent } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { BuildTxResult, SignTransferTxParams, SignTransferTxResult } from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import SignModalAssetsAmountsRows from '~/features/ecosystem/modals/SignModalAssetsAmountsRows'
import SignModalFeesRow from '~/features/ecosystem/modals/SignModalFeesRow'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import { SignTxModalCommonProps } from '~/features/ecosystem/modals/SignTxModalTypes'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useAppDispatch } from '~/hooks/redux'
import { signer } from '~/signer'

interface SignTransferTxModalProps extends SignTxModalCommonProps {
  txParams: SignTransferTxParams
  unsignedData: BuildTxResult<SignTransferTxResult>
  onSuccess: (signResult: SignTransferTxResult) => void
}

const SignTransferTxModal = memo(({ txParams, unsignedData, origin, onError, onSuccess }: SignTransferTxModalProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const { handleApprovePress, handleRejectPress, fees } = useSignModal({
    onError,
    unsignedData,
    sign: async () => {
      const data = await signer.signAndSubmitTransferTx(txParams)

      const { attoAlphAmount, tokens } = calculateAssetAmounts(txParams)

      dispatch(
        transactionSent({
          hash: data.txId,
          fromAddress: txParams.signerAddress,
          toAddress: txParams.destinations[0].address, // TODO: Improve display for multiple destinations
          // lockTime: TODO: Improve display of locked time per destination
          amount: attoAlphAmount.toString(),
          tokens: tokens.map((token) => ({ id: token.id, amount: token.amount.toString() })),
          timestamp: new Date().getTime(),
          status: 'sent',
          type: 'transfer'
        })
      )

      sendAnalytics({ event: 'Approved transfer', props: { origin } })

      onSuccess({
        fromGroup: data.fromGroup,
        toGroup: data.toGroup,
        unsignedTx: data.unsignedTx,
        txId: data.txId,
        signature: data.signature,
        gasAmount: data.gasAmount,
        gasPrice: BigInt(data.gasPrice)
      })
    }
  })

  return (
    <BottomModal2 contentVerticalGap>
      <ScreenSection>
        {txParams.destinations.map(({ address, attoAlphAmount, tokens }) => {
          const assetAmounts = [
            { id: ALPH.id, amount: BigInt(attoAlphAmount) },
            ...(tokens ? tokens.map((token) => ({ ...token, amount: BigInt(token.amount) })) : [])
          ]
          return (
            <Surface>
              <SignModalAssetsAmountsRows assetAmounts={assetAmounts} />

              <Row title={t('From')} titleColor="secondary">
                <AddressBadge addressHash={txParams.signerAddress} />
              </Row>

              <Row title={t('To')} titleColor="secondary">
                <AddressBadge addressHash={address} />
              </Row>
            </Surface>
          )
        })}

        <Surface>
          <SignModalFeesRow fees={fees} />
        </Surface>
      </ScreenSection>

      <SignTxModalFooterButtonsSection onReject={handleRejectPress} onApprove={handleApprovePress} />
    </BottomModal2>
  )
})

export default SignTransferTxModal

const calculateAssetAmounts = (txParams: SignTransferTxModalProps['txParams']) =>
  txParams.destinations.reduce(
    (acc, destination) => {
      acc.attoAlphAmount += BigInt(destination.attoAlphAmount)

      destination.tokens?.forEach((token) => {
        const t = acc.tokens.find(({ id }) => id === token.id)

        if (t) {
          t.amount += BigInt(token.amount)
        } else {
          acc.tokens.push({ id: token.id, amount: BigInt(token.amount) })
        }
      })

      return acc
    },
    { attoAlphAmount: BigInt(0), tokens: [] as { id: string; amount: bigint }[] }
  )
