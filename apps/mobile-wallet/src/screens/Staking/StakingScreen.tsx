import { AddressHash, addressSettingsSaved, selectAddressByHash, selectDefaultAddressHash } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import BaseHeader from '~/components/headers/BaseHeader'
import Screen from '~/components/layout/Screen'
import ScreenTitle from '~/components/layout/ScreenTitle'
import { openModal } from '~/features/modals/modalActions'
import useIsStakingEnabled from '~/features/staking/hooks/useIsStakingEnabled'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { store } from '~/store/store'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showExceptionToast, showToast, ToastDuration } from '~/utils/layout'

import StakingCard from './StakingCard'
import UnstakingRequestsList from './UnstakingRequestsList'

const StakingScreen = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
  const persistAddressSettings = usePersistAddressSettings()
  const isStakingEnabled = useIsStakingEnabled()
  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()
  const theme = useTheme()

  const handleSetDefaultAddress = useCallback(
    async (addressHash: AddressHash) => {
      if (!defaultAddressHash || addressHash === defaultAddressHash) return

      const address = selectAddressByHash(store.getState(), addressHash)
      if (!address) return

      try {
        const newSettings = { ...address, isDefault: true }

        await persistAddressSettings(newSettings)
        dispatch(addressSettingsSaved({ addressHash: address.hash, settings: newSettings }))

        showToast({ text1: 'This is now the default address', visibilityTime: ToastDuration.SHORT })
        sendAnalytics({ event: 'Set address as default', props: { origin: 'staking' } })
      } catch (error) {
        sendAnalytics({ type: 'error', error, message: 'Could not set default address from staking' })
        showExceptionToast(error, t('Default address'))
      }
    },
    [defaultAddressHash, dispatch, persistAddressSettings, t]
  )

  const openDefaultAddressModal = useCallback(() => {
    dispatch(openModal({ name: 'SelectAddressModal', props: { onAddressPress: handleSetDefaultAddress } }))
  }, [dispatch, handleSetDefaultAddress])

  const handleStakePress = () => {
    dispatch(openModal({ name: 'StakeModal' }))
  }

  const handleUnstakePress = () => {
    dispatch(openModal({ name: 'UnstakeModal' }))
  }

  if (!isStakingEnabled) return null

  return (
    <Screen>
      <BaseHeader options={{ headerTitle: t('Staking') as string }} scrollY={screenScrollY} />
      <StyledScrollView onScroll={screenScrollHandler} scrollEventThrottle={16}>
        <ScreenTitle title={t('Staking') as string} scrollY={screenScrollY} sideDefaultMargin paddingTop />

        <ContentContainer>
          {defaultAddressHash && (
            <DefaultAddressBlock>
              <AppText color="tertiary" size={13}>
                {t('Default address')}
              </AppText>
              <AddressBox
                addressHash={defaultAddressHash}
                hideAssets
                noBottomMargin
                showTokenAmount
                tokenId={ALPH.id}
                origin="selectAddressModal"
                rounded
                style={{ borderWidth: 1, borderColor: theme.border.primary }}
                onPress={openDefaultAddressModal}
              />
            </DefaultAddressBlock>
          )}

          <StakingCard />

          <ButtonsRow>
            <Button
              title={t('Stake') as string}
              onPress={handleStakePress}
              flex
              style={{ backgroundColor: theme.global.palette3 }}
            />
            <Button
              title={t('Unstake') as string}
              onPress={handleUnstakePress}
              type="secondary"
              variant="default"
              flex
            />
          </ButtonsRow>

          <Divider />

          <UnstakingRequestsList />
        </ContentContainer>
      </StyledScrollView>
    </Screen>
  )
}

export default StakingScreen

const StyledScrollView = styled.ScrollView`
  flex: 1;
`

const ContentContainer = styled.View`
  padding: 0 ${DEFAULT_MARGIN}px;
  padding-bottom: 120px;
  gap: 20px;
`

const DefaultAddressBlock = styled.View`
  gap: 8px;
`

const ButtonsRow = styled.View`
  flex-direction: row;
  gap: 10px;
`

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
`
