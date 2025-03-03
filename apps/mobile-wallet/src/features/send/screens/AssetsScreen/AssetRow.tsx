import { Asset, NFT } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import { StyleProp, ViewStyle } from 'react-native'
import { useTheme } from 'styled-components'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import Badge from '~/components/Badge'
import ListItem from '~/components/ListItem'
import NFTThumbnail from '~/components/NFTThumbnail'
import { useSendContext } from '~/contexts/SendContext'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import { isNft } from '~/utils/assets'
import { ImpactStyle, vibrate } from '~/utils/haptics'
import { showToast, ToastDuration } from '~/utils/layout'

interface AssetRowProps {
  asset: Asset | NFT
  isLast: boolean
  style?: StyleProp<ViewStyle>
}

const AssetRow = ({ asset, ...props }: AssetRowProps) => {
  const dispatch = useAppDispatch()
  const { fromAddress, setAssetAmount: setAssetAmountInContext, assetAmounts } = useSendContext()
  const theme = useTheme()
  const { t } = useTranslation()

  const assetIsNft = isNft(asset)

  const amount = assetAmounts.find((a) => a.id === asset.id)?.amount

  const handleRowPress = () => {
    vibrate(ImpactStyle.Medium)

    if (!assetIsNft) {
      dispatch(
        openModal({
          name: 'TokenAmountModal',
          props: { tokenId: asset.id, addressHash: fromAddress, onAmountValidate: onAmountSet, initialAmount: amount }
        })
      )
    } else {
      const isRemovingNft = !!assetAmounts.find((a) => a.id === asset.id)

      setAssetAmountInContext(asset.id, isRemovingNft ? undefined : BigInt(1))
      showMessage(isRemovingNft, asset.name)
    }
  }

  const onAmountSet = (amount: bigint) => {
    setAssetAmountInContext(asset.id, amount)
    showMessage(amount === BigInt(0), asset.name ?? asset.id)
  }

  const showMessage = (isRemoved: boolean, tokenName: string) => {
    showToast({
      text1: isRemoved ? t('Removed {{ tokenName }}', { tokenName }) : t('Added {{ tokenName }}', { tokenName }),
      type: 'info',
      visibilityTime: ToastDuration.SHORT
    })
  }

  return (
    <ListItem
      {...props}
      isSelected={!!amount}
      title={asset.name || asset.id}
      onPress={handleRowPress}
      height={64}
      rightSideContent={
        amount ? (
          assetIsNft ? (
            <Badge rounded solid color={theme.global.accent}>
              <AppText color="white" semiBold>
                {t('NFT')}
              </AppText>
            </Badge>
          ) : (
            <Badge rounded solid color={theme.global.accent}>
              <Amount
                value={amount}
                semiBold
                suffix={asset.symbol}
                decimals={asset.decimals}
                isUnknownToken={!asset.symbol}
                fullPrecision
                color="white"
              />
            </Badge>
          )
        ) : null
      }
      subtitle={
        assetIsNft ? (
          asset.description
        ) : !amount ? (
          <Amount
            value={asset.balance - asset.lockedBalance}
            suffix={asset.symbol}
            decimals={asset.decimals}
            isUnknownToken={!asset.symbol}
            medium
            color="tertiary"
          />
        ) : undefined
      }
      icon={assetIsNft ? <NFTThumbnail nftId={asset.id} size={32} /> : <AssetLogo assetId={asset.id} size={32} />}
    />
  )
}

export default AssetRow
