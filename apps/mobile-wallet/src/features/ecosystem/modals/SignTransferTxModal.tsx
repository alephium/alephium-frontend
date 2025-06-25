import { calculateTransferTxAssetAmounts, SignTransferTxModalProps, transactionSent } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
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
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useAppDispatch } from '~/hooks/redux'
import { signer } from '~/signer'

const SignTransferTxModal = memo(({ txParams, unsignedData, origin, onError, onSuccess }: SignTransferTxModalProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const { handleApprovePress, handleRejectPress, fees } = useSignModal({
    onError,
    unsignedData,
    sign: async () => {
      // Note: We might need to build sweep txs here by checking that the requested balances to be transfered
      // are exactly the same as the total balances of the signer address, like we do in the normal send flow.
      // That would make sense only if we have a single destination otherwise what should the sweep destination
      // address be?

      const data = await signer.signAndSubmitTransferTx(txParams)
      const assetAmounts = calculateTransferTxAssetAmounts(txParams)

      dispatch(
        transactionSent({
          hash: data.txId,
          fromAddress: txParams.signerAddress,
          toAddress: txParams.destinations[0].address, // TODO: Improve display for multiple destinations
          // lockTime: TODO: Improve display of locked time per destination
          amount: assetAmounts.find(({ id }) => id === ALPH.id)?.amount?.toString(),
          tokens: assetAmounts
            .filter(({ id }) => id !== ALPH.id)
            .map(({ id, amount }) => ({ id, amount: amount.toString() })),
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
