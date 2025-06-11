import { useTranslation } from 'react-i18next'
import { Image } from 'react-native'
import { styled } from 'styled-components/native'

import AppText from '~/components/AppText'
import Row from '~/components/Row'

interface DestinationDappRowProps {
  dAppUrl: string
  dAppIcon?: string
}

const DestinationDappRow = ({ dAppUrl, dAppIcon }: DestinationDappRowProps) => {
  const { t } = useTranslation()

  return (
    <Row title={t('To')} titleColor="secondary">
      {dAppIcon && <DappIcon source={{ uri: dAppIcon }} />}
      <AppText semiBold>{dAppUrl}</AppText>
    </Row>
  )
}

export default DestinationDappRow

const DappIcon = styled(Image)`
  width: 20px;
  height: 20px;
`
