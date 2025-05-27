import { AddressHash } from '@alephium/shared'
import { openBrowserAsync } from 'expo-web-browser'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import Button from '~/components/buttons/Button'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface UnknownTokensButtonProps {
  tokensCount: number
  addressHash?: AddressHash
}

const UnknownTokensButton = ({ tokensCount, addressHash }: UnknownTokensButtonProps) => {
  const explorerBaseUrl = useAppSelector((s) => s.network.settings.explorerUrl)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  if (tokensCount === 0) return null

  const handleUnknownTokensPress = () =>
    addressHash
      ? openBrowserAsync(`${explorerBaseUrl}/addresses/${addressHash}`)
      : dispatch(openModal({ name: 'UnknownTokensModal' }))

  return (
    <UnknownTokensButtonStyled>
      <Button
        title={t('unknownTokensKey', { count: tokensCount })}
        onPress={handleUnknownTokensPress}
        iconProps={{ name: 'plus' }}
        compact
      />
    </UnknownTokensButtonStyled>
  )
}

export default UnknownTokensButton

const UnknownTokensButtonStyled = styled.View`
  flex-grow: 0;
  margin: ${VERTICAL_GAP}px auto 0;
`
