/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { AddressHash } from '@alephium/shared'
import { openBrowserAsync } from 'expo-web-browser'
import { ChevronRightIcon } from 'lucide-react-native'
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

  // TODO: Don't use ListItem to display unknown tokens, needs re-design.
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
              See in explorer
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
