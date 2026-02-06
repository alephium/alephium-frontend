import { AddressHash, selectAddressByHash } from '@alephium/shared'
import { colord } from 'colord'
import { AlertCircle } from 'lucide-react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import InfoBox from '~/components/InfoBox'
import { useAppSelector } from '~/hooks/redux'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface SigningDeviceWarningProps {
  addressHash: AddressHash
}

const SigningDeviceWarning = ({ addressHash }: SigningDeviceWarningProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const theme = useTheme()

  if (!address || !address.isWatchOnly) return null

  return (
    <InfoBoxStyled
      narrow
      title="Verify on signing device"
      Icon={AlertCircle}
      bgColor={colord(theme.global.warning).alpha(0.15).toHex()}
      iconColor={theme.global.warning}
    >
      <AppText>Verify that the transaction data is correct on the signing device.</AppText>
    </InfoBoxStyled>
  )
}

export default SigningDeviceWarning

const InfoBoxStyled = styled(InfoBox)`
  margin-top: ${VERTICAL_GAP}px;
`
