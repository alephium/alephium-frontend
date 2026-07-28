import { AddressHash } from '@alephium/shared/types'
import { ALPH } from '@alephium/token-list'
import { useTranslation } from 'react-i18next'

import AddressSelectorCard from '~/components/AddressSelectorCard'
import { openModal } from '~/features/modals/modalActions'
import { selectStakingAddressHash } from '~/features/staking/stakingSelectors'
import { stakingAddressChanged } from '~/features/staking/stakingSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const StakingAddressSection = () => {
  const stakingAddressHash = useAppSelector(selectStakingAddressHash)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  if (!stakingAddressHash) return null

  const handleAddressPress = (addressHash: AddressHash) => dispatch(stakingAddressChanged(addressHash))

  const openAddressModal = () =>
    dispatch(openModal({ name: 'SelectAddressModal', props: { onAddressPress: handleAddressPress } }))

  return (
    <AddressSelectorCard
      label={t('Address to use')}
      addressHash={stakingAddressHash}
      tokenId={ALPH.id}
      onPress={openAddressModal}
    />
  )
}

export default StakingAddressSection
