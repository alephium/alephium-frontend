import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { Image } from 'react-native'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import FlashListScreen from '~/components/layout/FlashListScreen'
import ListItem from '~/components/ListItem'
import { connectionRemoved } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsActions'
import AuthorizedConnectionsEmptyList from '~/features/ecosystem/authorizedConnections/AuthorizedConnectionsEmptyList'
import { selectAllAuthorizedConnections } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsSelectors'
import { AuthorizedConnection } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsTypes'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'
import { ImpactStyle, vibrate } from '~/utils/haptics'
import { showToast } from '~/utils/layout'

const AuthorizedConnectionsScreen = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const connections = useAppSelector(selectAllAuthorizedConnections)

  const handleDisconnectPress = (connection: AuthorizedConnection) => {
    vibrate(ImpactStyle.Light)
    dispatch(connectionRemoved(connection))
    showToast({
      text1: t('Revoked connection to {{ host }}', { host: connection.host }),
      type: 'success'
    })
  }

  return (
    <FlashListScreen
      data={connections}
      estimatedItemSize={70}
      headerOptions={{ headerTitle: t('Preauthorized connections'), type: 'stack' }}
      screenTitle={t('Preauthorized connections')}
      screenIntro={t('Manage dApp connections')}
      contentPaddingTop
      renderItem={({ item: connection, index }) => (
        <ListItemStyled
          key={connection.host}
          title={<Title connection={connection} />}
          expandedSubtitle
          subtitle={<Subtitle connection={connection} />}
          isLast={index === connections.length - 1}
          icon={undefined}
          rightSideContent={
            <Button iconProps={{ name: 'close' }} squared compact onPress={() => handleDisconnectPress(connection)} />
          }
        />
      )}
      shouldUseGaps
      ListEmptyComponent={<AuthorizedConnectionsEmptyList hasHorizontalMargin />}
    />
  )
}

export default AuthorizedConnectionsScreen

const ListItemStyled = styled(ListItem)`
  padding: 0 ${DEFAULT_MARGIN}px;
`

const Title = ({ connection }: { connection: AuthorizedConnection }) => (
  <TitleStyled>
    {connection.icon ? <DappIcon source={{ uri: connection.icon }} /> : undefined}
    <AppText bold>{connection.host}</AppText>
  </TitleStyled>
)

const TitleStyled = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
`

const Subtitle = ({ connection }: { connection: AuthorizedConnection }) => {
  const { t } = useTranslation()

  return (
    <SubtitleStyled>
      <AddressBadge addressHash={connection.address} />
      <AppTextStyled color="secondary">
        {connection.networkName
          ? t('Connected at {{ datetime }} on {{ network }}', {
              datetime: dayjs(connection.dateTime).format('YYYY-MM-DD HH:mm'),
              network: connection.networkName
            })
          : t('Connected at {{ datetime }}', {
              datetime: dayjs(connection.dateTime).format('YYYY-MM-DD HH:mm')
            })}
      </AppTextStyled>
    </SubtitleStyled>
  )
}

const SubtitleStyled = styled.View`
  margin-top: ${VERTICAL_GAP / 3}px;
`

const AppTextStyled = styled(AppText)`
  margin-top: ${VERTICAL_GAP / 3}px;
`

const DappIcon = styled(Image)`
  width: 20px;
  height: 20px;
`
