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

import { AddressHash, CURRENCIES } from '@alephium/shared'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { colord } from 'colord'
import { LinearGradient } from 'expo-linear-gradient'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import SpinnerModal from '~/components/SpinnerModal'
import AddressCardDeleteButton from '~/features/address-deletion/AddressCardDeleteButton'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import DefaultAddressBadge from '~/images/DefaultAddressBadge'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { makeSelectAddressesTokensWorth } from '~/store/addresses/addressesSelectors'
import { addressSettingsSaved, selectAddressByHash } from '~/store/addressesSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { copyAddressToClipboard } from '~/utils/addresses'
import { showToast, ToastDuration } from '~/utils/layout'

interface AddressCardProps {
  addressHash: AddressHash
  onSettingsPress: () => void
  style?: StyleProp<ViewStyle>
}

const AddressCard = ({ style, addressHash, onSettingsPress }: AddressCardProps) => {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const navigation = useNavigation<NavigationProp<SendNavigationParamList>>()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const currency = useAppSelector((s) => s.settings.currency)
  const selectAddessesTokensWorth = useMemo(makeSelectAddressesTokensWorth, [])
  const balanceInFiat = useAppSelector((s) => selectAddessesTokensWorth(s, addressHash))
  const persistAddressSettings = usePersistAddressSettings()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)

  const isDefaultAddress = address?.settings.isDefault

  if (!address) return null

  const bgColor = address.settings.color ?? theme.font.primary
  const isDark = colord(bgColor).isDark()
  const textColor = isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.8)'
  const outterBorderColor = colord(bgColor).lighten(0.3).toHex()
  const innerBorderColor = isDark ? colord(bgColor).lighten(0.1).toHex() : colord(bgColor).darken(0.05).toHex()
  const buttonsBackground = isDark ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)'

  const handleSendPress = () => {
    sendAnalytics({ event: 'Address card: Selected address to send funds from' })

    navigation.navigate('SendNavigation', {
      screen: 'DestinationScreen',
      params: { fromAddressHash: addressHash }
    })
  }

  const handleReceivePress = () => {
    sendAnalytics({ event: 'Address card: Selected address to receive funds to' })

    navigation.navigate('ReceiveNavigation', {
      screen: 'QRCodeScreen',
      params: { addressHash }
    })
  }

  const handleDefaultAddressToggle = async () => {
    if (address.settings.isDefault) return

    setLoading(true)

    try {
      const newSettings = { ...address.settings, isDefault: true }

      await persistAddressSettings({ ...address, settings: newSettings })
      dispatch(addressSettingsSaved({ ...address, settings: newSettings }))

      showToast({ text1: 'This is now the default address', visibilityTime: ToastDuration.SHORT })

      sendAnalytics({ event: 'Address: Used address card default toggle' })
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Could not use address card default toggle' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View
      style={[
        style,
        {
          shadowColor: 'black',
          shadowOffset: { height: 5, width: 0 },
          shadowOpacity: theme.name === 'dark' ? 0.5 : 0.15,
          shadowRadius: 8,
          elevation: 3,
          borderColor: outterBorderColor,
          overflow: 'hidden'
        }
      ]}
    >
      <CardGradientContainer
        colors={[bgColor, colord(bgColor).saturate(0.15).lighten(0.05).toHex()]}
        start={{ x: 0.1, y: 0.3 }}
      >
        <Header>
          <AddressBadgeContainer>
            <Pressable onLongPress={() => copyAddressToClipboard(addressHash)}>
              <AddressBadgeStyled
                addressHash={address.hash}
                hideSymbol
                color={textColor}
                textStyle={{
                  fontSize: 23,
                  fontWeight: '700'
                }}
                canCopy={false}
              />
              {address.settings.label && (
                <HashEllipsed numberOfLines={1} ellipsizeMode="middle" color={textColor} size={13}>
                  {addressHash}
                </HashEllipsed>
              )}
            </Pressable>
          </AddressBadgeContainer>
          <HeaderButtons>
            <AddressCardDeleteButton addressHash={addressHash} color={textColor} />

            <Button
              onPress={handleDefaultAddressToggle}
              customIcon={
                <DefaultAddressBadge
                  strokeOnly={!isDefaultAddress}
                  size={18}
                  color={isDefaultAddress ? theme.global.accent : textColor}
                />
              }
              round
              type="transparent"
            />
            <Button
              iconProps={{ name: 'settings' }}
              color={textColor}
              onPress={onSettingsPress}
              round
              type="transparent"
            />
          </HeaderButtons>
        </Header>
        <Amounts>
          <FiatAmount
            value={balanceInFiat}
            isFiat
            color={textColor}
            size={32}
            bold
            suffix={CURRENCIES[currency].symbol}
          />
          <AddressGroup>
            <AppText style={{ color: textColor }} size={13}>
              {t('Group {{ groupNumber }}', { groupNumber: address.group })}
            </AppText>
          </AddressGroup>
        </Amounts>
        <BottomRow
          style={{
            borderTopColor: innerBorderColor,
            backgroundColor: buttonsBackground
          }}
        >
          <ButtonsRow sticked hasDivider dividerColor={innerBorderColor}>
            <Button
              title="Send"
              onPress={handleSendPress}
              iconProps={{ name: 'send' }}
              flex
              type="transparent"
              color={textColor}
            />
            <Button
              title="Receive"
              onPress={handleReceivePress}
              iconProps={{ name: 'download' }}
              flex
              type="transparent"
              color={textColor}
            />
          </ButtonsRow>
        </BottomRow>
      </CardGradientContainer>
      <SpinnerModal isActive={loading} text={`${t('Updating default address')}...`} />
    </View>
  )
}

export default styled(AddressCard)`
  border-radius: 24px;
  height: 220px;
  border-width: 1px;
  background-color: white;
`

const CardGradientContainer = styled(LinearGradient)`
  flex: 1;
  justify-content: space-between;
  border-radius: 23px;
`

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
  gap: 18px;
  padding: 15px 15px 0px 20px;
`

const AddressBadgeStyled = styled(AddressBadge)`
  flex-shrink: 1;
`

const AddressBadgeContainer = styled.View`
  flex-shrink: 1;
`

const HeaderButtons = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;
`

const Amounts = styled.View`
  padding: 15px;
  margin-left: ${DEFAULT_MARGIN}px;
`

const FiatAmount = styled(Amount)`
  margin-bottom: 5px;
`

const AddressGroup = styled.View`
  position: absolute;
  right: 15px;
  bottom: 0px;
  opacity: 0.6;
`

const BottomRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-top-width: 1px;
`

const HashEllipsed = styled(AppText)`
  max-width: 100px;
`
