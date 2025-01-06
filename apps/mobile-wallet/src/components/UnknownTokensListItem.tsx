import { AddressHash } from '@alephium/shared'
import { openBrowserAsync } from 'expo-web-browser'
import { ChevronRightIcon } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import Badge from '~/components/Badge'
import ListItem from '~/components/ListItem'
import { useAppSelector } from '~/hooks/redux'

export type UnknownTokensEntry = {
  numberOfUnknownTokens: number
  addressHash?: AddressHash
}

interface UnknownTokensListItemProps {
  entry: UnknownTokensEntry
}

const UnknownTokensListItem = ({ entry }: UnknownTokensListItemProps) => {
  const theme = useTheme()
  const explorerBaseUrl = useAppSelector((s) => s.network.settings.explorerUrl)
  const { t } = useTranslation()

  return (
    <ListItem
      title="Unknown tokens"
      icon={<AssetLogo assetId="" size={38} />}
      hideSeparator
      rightSideContent={<Badge>{entry.numberOfUnknownTokens}</Badge>}
      subtitle={
        entry.addressHash ? (
          <ExplorerLink onPress={() => openBrowserAsync(`${explorerBaseUrl}/addresses/${entry.addressHash}`)}>
            <AppText color={theme.global.accent} semiBold>
              {t('See in explorer')}
            </AppText>
            <ChevronRightIcon size={20} color={theme.global.accent} />
          </ExplorerLink>
        ) : undefined
      }
    />
  )
}

export default UnknownTokensListItem

const UnknownTokensEntry = styled.View`
  padding: 16px;
`

const ExplorerLink = styled.Pressable`
  flex-direction: row;
  align-items: center;
`
