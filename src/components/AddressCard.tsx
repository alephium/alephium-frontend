/*
Copyright 2018 - 2022 The Alephium Authors
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

import { calculateAmountWorth } from '@alephium/sdk'
import { colord } from 'colord'
import { LinearGradient } from 'expo-linear-gradient'
import { Copy, SettingsIcon } from 'lucide-react-native'
import { StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { useAppSelector } from '~/hooks/redux'
import DefaultAddressBadge from '~/images/DefaultAddressBadge'
import { selectAddressByHash } from '~/store/addressesSlice'
import { useGetPriceQuery } from '~/store/assets/priceApiSlice'
import { themes, ThemeType } from '~/style/themes'
import { AddressHash } from '~/types/addresses'
import { copyAddressToClipboard } from '~/utils/addresses'
import { currencies } from '~/utils/currencies'
import { navigateRootStack } from '~/utils/navigation'

interface AddressCardProps {
  addressHash: AddressHash
  style?: StyleProp<ViewStyle>
}

const AddressCard = ({ style, addressHash }: AddressCardProps) => {
  const theme = useTheme()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const currency = useAppSelector((s) => s.settings.currency)
  const totalAddressBalance = BigInt(address?.balance ?? 0) + BigInt(address?.lockedBalance ?? 0)
  const { data: price } = useGetPriceQuery(currencies[currency].ticker, {
    pollingInterval: 60000,
    skip: totalAddressBalance === BigInt(0)
  })

  const totalAmountWorth = calculateAmountWorth(totalAddressBalance, price ?? 0)

  if (!address) return null

  const bgColor = address.settings.color ?? theme.font.primary
  const textColorTheme: ThemeType = colord(bgColor).isDark() ? 'dark' : 'light'
  const textColor = themes[textColorTheme].font.primary

  return (
    <LinearGradient style={style} colors={[bgColor, colord(bgColor).darken(0.1).toHex()]} start={{ x: 0.1, y: 0.3 }}>
      <Header>
        <AddressBadgeContainer>
          <AddressBadgeStyled
            addressHash={address.hash}
            hideSymbol
            textStyle={{
              fontSize: 23,
              fontWeight: '700',
              color: textColor
            }}
          />
          {address.settings.isDefault && <DefaultAddressBadge size={18} color={textColor} />}
        </AddressBadgeContainer>
        <Button
          Icon={SettingsIcon}
          type="transparent"
          color={textColor}
          onPress={() => navigateRootStack('EditAddressScreen', { addressHash })}
        />
      </Header>
      <Amounts>
        <FiatAmount
          value={totalAmountWorth}
          isFiat
          colorTheme={textColorTheme}
          size={30}
          semiBold
          suffix={currencies[currency].symbol}
        />
        <Amount value={BigInt(address.balance)} colorTheme={textColorTheme} size={15} medium suffix="ALPH" />
      </Amounts>
      <BottomRow>
        <CopyAddressBadge onPress={() => copyAddressToClipboard(address.hash)}>
          <HashEllipsed numberOfLines={1} ellipsizeMode="middle" colorTheme={textColorTheme}>
            {address.hash}
          </HashEllipsed>
          <Copy size={11} color={textColor} />
        </CopyAddressBadge>
        <AppText size={14} colorTheme={textColorTheme}>
          Group {address.group}
        </AppText>
      </BottomRow>
    </LinearGradient>
  )
}

export default styled(AddressCard)`
  border-radius: 16px;
  height: 200px;
  padding: 16px 19px 16px 23px;
  justify-content: space-between;
`

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  max-width: 100%;
  align-items: center;
  gap: 18px;
`

const AddressBadgeStyled = styled(AddressBadge)`
  flex-shrink: 1;
`

const AddressBadgeContainer = styled.View`
  flex-direction: row;
  flex-shrink: 1;
  align-items: center;
  justify-content: flex-start;
  gap: 18px;
`

const Amounts = styled.View``

const FiatAmount = styled(Amount)`
  margin-bottom: 5px;
`

const HashEllipsed = styled(AppText)`
  flex-shrink: 1;
`

const CopyAddressBadge = styled.Pressable`
  flex-direction: row;
  align-items: center;
  padding: 5px 10px;
  gap: 10px;
  max-width: 158px;
  border-radius: 22px;
  background-color: ${({ theme }) => colord(theme.bg.primary).alpha(0.14).toHex()};
`

const BottomRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`
