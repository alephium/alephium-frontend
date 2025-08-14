import { SignChainedTxModalProps } from '@alephium/shared'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Fragment, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import { sendChainedTransactions } from '~/api/transactions'
import AppText from '~/components/AppText'
import Surface from '~/components/layout/Surface'
import { SignDeployContractTxModalContent } from '~/features/ecosystem/modals/SignDeployContractTxModal'
import { SignExecuteScriptTxModalContent } from '~/features/ecosystem/modals/SignExecuteScriptTxModal'
import { SignTransferTxModalContent } from '~/features/ecosystem/modals/SignTransferTxModal'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { VERTICAL_GAP } from '~/style/globalStyle'

const TransactionSeparator = () => {
  return (
    <Separator>
      <ChainIcon name="chevron-down" size={18} />
    </Separator>
  )
}

export default TransactionSeparator

const Separator = styled.View`
  position: relative;
  display: flex;
  width: 100%;
  justify-content: center;
  padding: ${VERTICAL_GAP / 2}px 0;
`

const ChainIcon = styled(Ionicons)`
  margin-left: auto;
  margin-right: auto;
  color: ${({ theme }) => theme.font.tertiary};
`
