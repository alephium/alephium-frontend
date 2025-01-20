import { AddressHash, Asset, CURRENCIES } from '@alephium/shared'
import { Optional } from '@alephium/web3'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import ListItem, { ListItemProps } from '~/components/ListItem'
import { openModal } from '~/features/modals/modalActions'
import { ModalInstance } from '~/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

interface TokenListItemProps extends Optional<ListItemProps, 'title' | 'icon'> {
  asset: Asset
  addressHash?: AddressHash
  parentModalId?: ModalInstance['id']
}

const TokenListItem = ({ asset, addressHash, parentModalId, ...props }: TokenListItemProps) => {
  const currency = useAppSelector((s) => s.settings.currency)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const balance = BigInt(asset.balance)

  const openTokenDetailsModal = () =>
    dispatch(openModal({ name: 'TokenDetailsModal', props: { tokenId: asset.id, addressHash, parentModalId } }))

  const openTokenQuickActionsModal = () =>
    dispatch(openModal({ name: 'TokenQuickActionsModal', props: { tokenId: asset.id } }))

  return (
    <ListItem
      title={asset.name || asset.id}
      subtitle={
        !asset.verified && (
          <UnverifiedBadge>
            <AppText size={10} color="tertiary">
              {t('No metadata')}
            </AppText>
          </UnverifiedBadge>
        )
      }
      icon={<AssetLogo assetId={asset.id} size={38} />}
      rightSideContent={
        <Amounts>
          <AmountStyled
            value={balance}
            decimals={asset.decimals}
            isUnknownToken={!asset.symbol}
            fadeDecimals
            suffix={asset.symbol}
            bold
            useTinyAmountShorthand
          />
          {asset.worth !== undefined && (
            <FiatAmountStyled isFiat value={asset.worth} suffix={CURRENCIES[currency].symbol} color="secondary" />
          )}
        </Amounts>
      }
      onPress={openTokenDetailsModal}
      onLongPress={openTokenQuickActionsModal}
      {...props}
    />
  )
}

export default TokenListItem

const AmountStyled = styled(Amount)`
  flex-shrink: 0;
  align-self: center;
`

const UnverifiedBadge = styled.View`
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: 1px 2px;
  border-radius: 4px;
  align-self: flex-start;
  margin-top: 3px;
`

const Amounts = styled.View``

const FiatAmountStyled = styled(Amount)`
  flex-shrink: 0;
  align-self: flex-end;
  margin-top: 5px;
`
