import { selectAddressByHash, SignTransferTxModalProps } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { Fragment, memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendTransferTransaction } from '@/api/transactions'
import TokenAmountsBox from '@/components/TokenAmountsBox'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckLockTimeBox from '@/features/send/CheckLockTimeBox'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import SignTxBaseModal from '@/features/walletConnect/SignTxBaseModal'
import { useAppSelector } from '@/hooks/redux'

const SignTransferTxModal = memo(
  ({ dAppUrl, txParams, unsignedData, onSuccess, ...props }: ModalBaseProp & SignTransferTxModalProps) => {
    const { t } = useTranslation()
    const { isLedger, onLedgerError } = useLedger()
    const signerAddress = useAppSelector((s) => selectAddressByHash(s, txParams.signerAddress))
    const { sendAnalytics } = useAnalytics()
    const maxLockTime = useMaxLockTime(txParams.destinations)

    const handleSignAndSubmit = useCallback(async () => {
      if (!signerAddress) throw Error('Signer address not found')

      // Note: We might need to build sweep txs here by checking that the requested balances to be transfered
      // are exactly the same as the total balances of the signer address, like we do in the normal send flow.
      // That would make sense only if we have a single destination otherwise what should the sweep destination
      // address be?
      const result = await sendTransferTransaction(txParams, isLedger, {
        signerIndex: signerAddress.index,
        onLedgerError
      })

      onSuccess(result)
      sendAnalytics({ event: 'Sent transaction', props: { origin: 'wc' } })
    }, [isLedger, onLedgerError, onSuccess, sendAnalytics, signerAddress, txParams])

    const fees = useMemo(() => BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice), [unsignedData])

    return (
      <SignTxBaseModal title={t('Send')} sign={handleSignAndSubmit} lockTime={maxLockTime} type="TRANSFER" {...props}>
        <SignTransferTxModalContent txParams={txParams} fees={fees} dAppUrl={dAppUrl} />
      </SignTxBaseModal>
    )
  }
)

export default SignTransferTxModal

export const SignTransferTxModalContent = ({
  txParams,
  fees,
  dAppUrl
}: Pick<SignTransferTxModalProps, 'txParams' | 'dAppUrl'> & { fees: bigint }) =>
  txParams.destinations.map(({ address, attoAlphAmount, tokens, lockTime }) => {
    const assetAmounts = [
      { id: ALPH.id, amount: BigInt(attoAlphAmount) },
      ...(tokens ? tokens.map((token) => ({ ...token, amount: BigInt(token.amount) })) : [])
    ]
    return (
      <Fragment key={address}>
        <TokenAmountsBox assetAmounts={assetAmounts} hasBg hasHorizontalPadding shouldAddAlphForDust />
        <CheckAddressesBox
          fromAddressStr={txParams.signerAddress}
          toAddressHash={address}
          dAppUrl={dAppUrl}
          hasBg
          hasHorizontalPadding
        />
        {lockTime && <CheckLockTimeBox lockTime={new Date(lockTime)} />}
        <CheckWorthBox assetAmounts={assetAmounts} fee={fees} hasBg hasBorder hasHorizontalPadding />
      </Fragment>
    )
  })

const useMaxLockTime = (destinations: SignTransferTxModalProps['txParams']['destinations']) =>
  useMemo(
    () =>
      destinations.reduce((max, { lockTime }) => {
        if (lockTime && lockTime > max) {
          return lockTime
        }
        return max
      }, 0),
    [destinations]
  )
