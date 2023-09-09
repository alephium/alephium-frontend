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
import { StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import { useAppSelector } from '~/hooks/redux'
import DefaultAddressBadge from '~/images/DefaultAddressBadge'
import { selectAddressByHash } from '~/store/addressesSlice'
import { useGetPriceQuery } from '~/store/assets/priceApiSlice'
import { themes, ThemeType } from '~/style/themes'
import { AddressHash } from '~/types/addresses'
import { currencies } from '~/utils/currencies'

interface AddressCardProps {
  addressHash: AddressHash
  onSettingsPress: () => void
  style?: StyleProp<ViewStyle>
}

const AddressCard = ({ style, addressHash, onSettingsPress }: AddressCardProps) => {
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
          {address.settings.isDefault && <DefaultAddressBadge size={18} color={textColor} />}
          <AddressBadgeStyled
            addressHash={address.hash}
            hideSymbol
            textStyle={{
              fontSize: 23,
              fontWeight: '700',
              color: textColor
            }}
            showCopyBtn
          />
          <AppText size={14} colorTheme={textColorTheme}>
            Group {address.group}
          </AppText>
        </AddressBadgeContainer>
        <Button
          iconProps={{ name: 'settings-outline' }}
          type="transparent"
          color={textColor}
          onPress={onSettingsPress}
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
        <ButtonsRow sticked>
          <Button iconProps={{ name: 'arrow-up-outline' }} title="Send" flex type="transparent" />
          <Button iconProps={{ name: 'arrow-down-outline' }} title="Receive" flex type="transparent" />
        </ButtonsRow>
      </BottomRow>
    </LinearGradient>
  )
}

export default styled(AddressCard)`
  border-radius: 16px;
  height: 220px;
  justify-content: space-between;
`

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  max-width: 100%;
  align-items: center;
  gap: 18px;
  padding: 15px 15px 0px 15px;
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

const Amounts = styled.View`
  padding: 15px;
`

const FiatAmount = styled(Amount)`
  margin-bottom: 5px;
`

const BottomRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 50px;

  background-color: rgba(0, 0, 0, 0.2);
`
