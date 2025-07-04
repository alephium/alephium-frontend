import { SignTransferTxModalProps } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { sendTransferTransactions } from '~/api/transactions'
import AddressBadge from '~/components/AddressBadge'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import SignModalAssetsAmountsRows from '~/features/ecosystem/modals/SignModalAssetsAmountsRows'
import SignModalFeesRow from '~/features/ecosystem/modals/SignModalFeesRow'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'

const SignTransferTxModal = memo(({ txParams, unsignedData, origin, onError, onSuccess }: SignTransferTxModalProps) => {
  const { handleApprovePress, handleRejectPress } = useSignModal({
    onError,
    type: 'TRANSFER',
    sign: async () => {
      // Note: We might need to build sweep txs here by checking that the requested balances to be transfered
      // are exactly the same as the total balances of the signer address, like we do in the normal send flow.
      // That would make sense only if we have a single destination otherwise what should the sweep destination
      // address be?

      const result = await sendTransferTransactions(txParams)

      onSuccess({ ...result, gasPrice: BigInt(result.gasPrice) })
      sendAnalytics({ event: 'Approved transfer', props: { origin } })
    }
  })

  const fees = BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice)

  return (
    <BottomModal2 contentVerticalGap>
      <ScreenSection>
        <SignTransferTxModalContent txParams={txParams} fees={fees} />
      </ScreenSection>

      <SignTxModalFooterButtonsSection onReject={handleRejectPress} onApprove={handleApprovePress} />
    </BottomModal2>
  )
})

export default SignTransferTxModal

export const SignTransferTxModalContent = ({
  txParams,
  fees
}: Pick<SignTransferTxModalProps, 'txParams'> & { fees: bigint }) => (
  <>
    {txParams.destinations.map(({ address, attoAlphAmount, tokens }) => {
      const assetAmounts = [
        { id: ALPH.id, amount: BigInt(attoAlphAmount) },
        ...(tokens ? tokens.map((token) => ({ ...token, amount: BigInt(token.amount) })) : [])
      ]
      return (
        <Surface key={address}>
          <SignModalAssetsAmountsRows assetAmounts={assetAmounts} />
          <SignTransferTxModalAddressesRows fromAddress={txParams.signerAddress} toAddress={address} />
        </Surface>
      )
    })}
    <Surface>
      <SignModalFeesRow fees={fees} />
    </Surface>
  </>
)

export const SignTransferTxModalAddressesRows = ({
  fromAddress,
  toAddress
}: {
  fromAddress: string
  toAddress: string
}) => {
  const { t } = useTranslation()

  return (
    <>
      <Row title={t('From')} titleColor="secondary">
        <AddressBadge addressHash={fromAddress} />
      </Row>

      <Row title={t('To')} titleColor="secondary">
        <AddressBadge addressHash={toAddress} />
      </Row>
    </>
  )
}
