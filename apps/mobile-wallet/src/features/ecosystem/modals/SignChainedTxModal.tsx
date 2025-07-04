import { SignChainedTxModalProps } from '@alephium/shared'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Fragment, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import { sendChainedTransactions } from '~/api/transactions'
import AppText from '~/components/AppText'
import { ScreenSection } from '~/components/layout/Screen'
import { SignDeployContractTxModalContent } from '~/features/ecosystem/modals/SignDeployContractTxModal'
import { SignExecuteScriptTxModalContent } from '~/features/ecosystem/modals/SignExecuteScriptTxModal'
import { SignTransferTxModalContent } from '~/features/ecosystem/modals/SignTransferTxModal'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { VERTICAL_GAP } from '~/style/globalStyle'

const SignChainedTxModal = memo(
  ({ txParams, props, origin, onError, onSuccess, dAppUrl, dAppIcon }: SignChainedTxModalProps) => {
    const { handleApprovePress, handleRejectPress } = useSignModal({
      onError,
      type: 'CHAINED',
      sign: async () => {
        const results = await sendChainedTransactions(txParams)

        sendAnalytics({ event: 'Approved chained tx', props: { origin } })
        onSuccess(results)
      }
    })

    return (
      <BottomModal2 contentVerticalGap>
        <SignChainedTxModalContent props={props} dAppUrl={dAppUrl} dAppIcon={dAppIcon} />
        <SignTxModalFooterButtonsSection onReject={handleRejectPress} onApprove={handleApprovePress} />
      </BottomModal2>
    )
  }
)

export default SignChainedTxModal

export const SignChainedTxModalContent = ({
  props,
  dAppUrl,
  dAppIcon
}: Pick<SignChainedTxModalProps, 'props' | 'dAppUrl' | 'dAppIcon'>) => {
  const { t } = useTranslation()

  return (
    <ScreenSection>
      {props.map(({ txParams, unsignedData, type }, index) => {
        let content = null
        switch (type) {
          case 'TRANSFER': {
            const fees = BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice)
            content = <SignTransferTxModalContent txParams={txParams} fees={fees} />
            break
          }
          case 'DEPLOY_CONTRACT': {
            const fees = BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice)
            content = (
              <SignDeployContractTxModalContent txParams={txParams} fees={fees} dAppUrl={dAppUrl} dAppIcon={dAppIcon} />
            )
            break
          }
          case 'EXECUTE_SCRIPT': {
            const fees = BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice)
            content = (
              <SignExecuteScriptTxModalContent txParams={txParams} fees={fees} dAppUrl={dAppUrl} dAppIcon={dAppIcon} />
            )
            break
          }
        }

        return (
          <Fragment key={index}>
            <AppText size={16} bold style={{ textAlign: 'center', marginTop: VERTICAL_GAP }}>
              {t('Transaction {{ number }}', { number: index + 1 })}
            </AppText>
            {content}
            {index !== props.length - 1 && (
              <Separator>
                <SeparatorLine />
                <SeparatorIcon>
                  <ChainIcon name="link-outline" size={18} />
                </SeparatorIcon>
              </Separator>
            )}
          </Fragment>
        )
      })}
    </ScreenSection>
  )
}

const Separator = styled.View`
  position: relative;
  display: flex;
  width: 100%;
  justify-content: center;
  padding: ${VERTICAL_GAP}px 0;
`

const SeparatorLine = styled.View`
  height: 2px;
  background-color: ${({ theme }) => theme.border.primary};
  width: 100%;
`

const SeparatorIcon = styled.View`
  position: absolute;
  width: 100%;
`

const ChainIcon = styled(Ionicons)`
  margin-left: auto;
  margin-right: auto;
  background-color: ${({ theme }) => theme.bg.back1};
  transform: rotate(90deg);
`
