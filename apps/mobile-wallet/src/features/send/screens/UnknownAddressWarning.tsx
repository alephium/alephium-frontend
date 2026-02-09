import { AddressHash, selectAddressByHash } from '@alephium/shared'
import { useFetchAddressLatestTransaction } from '@alephium/shared-react'
import { colord } from 'colord'
import { AlertCircle } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import InfoBox from '~/components/InfoBox'
import { useAppSelector } from '~/hooks/redux'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface UnknownAddressWarningProps {
  addressHash: AddressHash
}

const UnknownAddressWarning = ({ addressHash }: UnknownAddressWarningProps) => {
  const { t } = useTranslation()
  const { data, isLoading } = useFetchAddressLatestTransaction(addressHash)
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const theme = useTheme()

  const addressIsActive = !!data?.latestTx?.timestamp

  if (!!address || isLoading || addressIsActive) return null

  return (
    <InfoBoxStyled
      narrow
      title={t('Unknown address')}
      Icon={AlertCircle}
      bgColor={colord(theme.global.warning).alpha(0.15).toHex()}
      iconColor={theme.global.warning}
    >
      <AppText>
        {t(
          'The destination address has never been used before and does not appear in your transaction history. Please, ensure the address is correct before sending.'
        )}
      </AppText>
    </InfoBoxStyled>
  )
}

export default UnknownAddressWarning

const InfoBoxStyled = styled(InfoBox)`
  margin-top: ${VERTICAL_GAP}px;
`
