import { AddressHash } from '@alephium/shared'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import Animated from 'react-native-reanimated'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressCard from '~/components/AddressCard'
import AddressesTokensList from '~/components/AddressesTokensList'
import Button from '~/components/buttons/Button'
import Carousel from '~/components/Carousel'
import BottomBarScrollScreen from '~/components/layout/BottomBarScrollScreen'
import { TabBarPageScreenProps } from '~/components/layout/TabBarPager'
import RefreshSpinner from '~/components/RefreshSpinner'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAddressByHash, selectAddressIds, selectAllAddresses, selectDefaultAddress } from '~/store/addressesSlice'

const AddressesScreen = ({ contentStyle, ...props }: TabBarPageScreenProps) => {
  const dispatch = useAppDispatch()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const addresses = useAppSelector(selectAllAddresses)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const [selectedAddressHash, setSelectedAddressHash] = useState(defaultAddress?.hash ?? '')
  const selectedAddress = useAppSelector((s) => selectAddressByHash(s, selectedAddressHash))

  const [heightCarouselItem, setHeightCarouselItem] = useState(235)
  const [scrollToCarouselPage, setScrollToCarouselPage] = useState<number>()
  const [isSwiping, setIsSwiping] = useState(false)

  useEffect(() => {
    if (defaultAddress?.hash) {
      setSelectedAddressHash(defaultAddress.hash)
      setScrollToCarouselPage(0)
    }
  }, [addressHashes, defaultAddress?.hash])

  const onAddressCardsScrollEnd = (index: number) => {
    Haptics.selectionAsync()

    if (index < addressHashes.length) {
      setSelectedAddressHash(addressHashes[index])
      setScrollToCarouselPage(index)
      setIsSwiping(false)
    }
  }

  const handleAddressSelect = (addressHash: AddressHash) => {
    setSelectedAddressHash(addressHash)
    setScrollToCarouselPage(addressHashes.findIndex((hash) => hash === addressHash))
    sendAnalytics({ event: 'Used address quick navigation' })
  }

  const openAddressSelectModal = () =>
    dispatch(openModal({ name: 'SelectAddressModal', props: { onAddressPress: handleAddressSelect } }))

  const renderAddressCard = ({ item }: { item: string }) => (
    <View onLayout={(event) => setHeightCarouselItem(event.nativeEvent.layout.height + 15)} key={item}>
      <AddressCard
        addressHash={item}
        onSettingsPress={() => navigation.navigate('EditAddressScreen', { addressHash: item })}
      />
    </View>
  )

  if (!selectedAddress) return null

  return (
    <BottomBarScrollScreen
      refreshControl={<RefreshSpinner progressViewOffset={190} />}
      hasBottomBar
      contentPaddingTop
      {...props}
    >
      <Content style={contentStyle}>
        <Carousel
          data={addressHashes}
          renderItem={renderAddressCard}
          onSwipingStart={() => setIsSwiping(true)}
          onScrollEnd={onAddressCardsScrollEnd}
          padding={20}
          distance={10}
          height={heightCarouselItem}
          scrollTo={scrollToCarouselPage}
          FooterComponent={
            addresses.length > 2 && (
              <Button onPress={openAddressSelectModal} iconProps={{ name: 'list' }} squared compact />
            )
          }
        />
        {selectedAddress && <AddressesTokensList addressHash={selectedAddress.hash} isRefreshing={isSwiping} />}
      </Content>
    </BottomBarScrollScreen>
  )
}

export default AddressesScreen

const Content = styled(Animated.View)`
  flex: 1;
  gap: 10px;
`
