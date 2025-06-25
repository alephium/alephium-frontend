import { isGrouplessKeyType, selectAddressByHash, SignTransferTxModalProps, transactionSent } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { SignTransferTxResult } from '@alephium/web3'
import { usePostHog } from 'posthog-js/react'
import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useLedger } from '@/features/ledger/useLedger'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckLockTimeBox from '@/features/send/CheckFeeLockTimeBox'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import SignTxBaseModal from '@/features/walletConnect/SignTxBaseModal'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { signer } from '@/signer'

const SignTransferTxModal = memo(
  ({ dAppUrl, txParams, unsignedData, onSuccess, ...props }: ModalBaseProp & SignTransferTxModalProps) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()
    const { isLedger, onLedgerError } = useLedger()
    const signerAddress = useAppSelector((s) => selectAddressByHash(s, txParams.signerAddress))
    const posthog = usePostHog()

    const fees = useMemo(() => BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice), [unsignedData])
    const maxLockTime = useMemo(
      () =>
        txParams.destinations.reduce((max, { lockTime }) => {
          if (lockTime && lockTime > max) {
            return lockTime
          }
          return max
        }, 0),
      [txParams.destinations]
    )

    const onSignAndSubmit = useCallback(async () => {
      if (!signerAddress) throw Error('Signer address not found')

      // TODO: Check if sweep needs to be handled here, like in handleTransferSend

      let result: SignTransferTxResult

      if (isLedger) {
        if (isGrouplessKeyType(signerAddress.keyType)) throw Error('Groupless address not supported on Ledger')

        result = await signer.signAndSubmitTransferTxLedger(txParams, {
          signerIndex: signerAddress.index,
          signerKeyType: signerAddress.keyType ?? 'default',
          onLedgerError
        })
      } else {
        result = await signer.signAndSubmitTransferTx(txParams)
      }

      onSuccess(result)

      dispatch(
        transactionSent({
          hash: result.txId,
          fromAddress: txParams.signerAddress,
          toAddress: txParams.destinations[0].address, // TODO: Improve display for multiple destinations
          amount: txParams.destinations[0].attoAlphAmount.toString(),
          tokens: txParams.destinations[0].tokens?.map((token) => ({
            id: token.id,
            amount: token.amount.toString()
          })),
          timestamp: new Date().getTime(),
          lockTime: txParams.destinations[0].lockTime, // TODO: Improve display of locked time per destination
          type: 'transfer',
          status: 'sent'
        })
      )

      posthog.capture(
        'Sent transaction'
        // TODO:  { number_of_tokens: tokens.length, locked: !!lockTime }
      )
    }, [dispatch, isLedger, onLedgerError, onSuccess, posthog, signerAddress, txParams])

    return (
      <SignTxBaseModal
        title={t('Send')}
        onSignAndSubmit={onSignAndSubmit}
        txParams={txParams}
        unsignedData={unsignedData}
        onSuccess={onSuccess}
        lockTime={maxLockTime}
        {...props}
      >
        {txParams.destinations.map(({ address, attoAlphAmount, tokens, lockTime }) => {
          const assetAmounts = [
            { id: ALPH.id, amount: BigInt(attoAlphAmount) },
            ...(tokens ? tokens.map((token) => ({ ...token, amount: BigInt(token.amount) })) : [])
          ]
          return (
            <>
              <CheckAmountsBox assetAmounts={assetAmounts} hasBg hasHorizontalPadding />
              <CheckAddressesBox
                fromAddressStr={txParams.signerAddress}
                toAddressHash={address}
                dAppUrl={dAppUrl}
                hasBg
                hasHorizontalPadding
              />
              {lockTime && <CheckLockTimeBox lockTime={new Date(lockTime)} />}
              <CheckWorthBox assetAmounts={assetAmounts} fee={fees} hasBg hasBorder hasHorizontalPadding />
            </>
          )
        })}
      </SignTxBaseModal>
    )
  }
)

export default SignTransferTxModal
