import { AddressHash, isFT, isNFT, toHumanReadableAmount, TokenId } from '@alephium/shared'
import { useFetchAddressSingleTokenBalances, useFetchToken } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'
import { StyleProp, ViewStyle } from 'react-native'
import { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import Badge from '~/components/Badge'
import ListItem from '~/components/ListItem'
import NFTThumbnail from '~/components/NFTThumbnail'
import { useSendContext } from '~/contexts/SendContext'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import { ImpactStyle, vibrate } from '~/utils/haptics'
import { showToast, ToastDuration } from '~/utils/layout'

interface TokenRowProps {
  tokenId: TokenId
  isLast: boolean
  addressHash: AddressHash
  style?: StyleProp<ViewStyle>
}

const TokenRow = ({ tokenId, addressHash, ...props }: TokenRowProps) => {
  const dispatch = useAppDispatch()
  const { fromAddress, setAssetAmount: setAssetAmountInContext, assetAmounts } = useSendContext()
  const theme = useTheme()
  const { t } = useTranslation()

  const { data: token } = useFetchToken(tokenId)
  const { data: addressTokenBalances } = useFetchAddressSingleTokenBalances({ addressHash, tokenId })
  const availableTokenBalance = addressTokenBalances ? BigInt(addressTokenBalances.availableBalance) : undefined

  if (!token) return null

  const amount = assetAmounts.find((a) => a.id === tokenId)?.amount
  const tokenName = isFT(token) || isNFT(token) ? token.name : tokenId

  const handleRowPress = () => {
    vibrate(ImpactStyle.Medium)

    if (!isNFT(token) && fromAddress) {
      const decimals = isFT(token) ? token.decimals : undefined
      const initialAmount = amount ? toHumanReadableAmount(amount, decimals) : undefined

      dispatch(
        openModal({
          name: 'TokenAmountModal',
          props: {
            tokenId,
            addressHash: fromAddress,
            onAmountValidate: onAmountSet,
            initialAmount
          }
        })
      )
    } else {
      const isRemovingNft = !!assetAmounts.find((a) => a.id === tokenId)

      setAssetAmountInContext(tokenId, isRemovingNft ? undefined : BigInt(1))
      showMessage(isRemovingNft)
    }
  }

  const onAmountSet = (amount: bigint) => {
    setAssetAmountInContext(tokenId, amount)
    showMessage(amount === BigInt(0))
  }

  const showMessage = (isRemoved: boolean) => {
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
      title={tokenName}
      onPress={handleRowPress}
      height={64}
      rightSideContent={
        amount ? (
          isNFT(token) ? (
            <Badge rounded solid color={theme.global.accent}>
              <AppText color="white" semiBold>
                {t('NFT')}
              </AppText>
            </Badge>
          ) : (
            <Badge rounded solid color={theme.global.accent}>
              {isFT(token) ? (
                <Amount
                  value={amount}
                  semiBold
                  suffix={token.symbol}
                  decimals={token.decimals}
                  fullPrecision
                  color="white"
                />
              ) : (
                <Amount value={amount} semiBold isUnknownToken fullPrecision />
              )}
            </Badge>
          )
        ) : null
      }
      subtitle={
        isNFT(token) ? (
          token.description
        ) : !amount && availableTokenBalance ? (
          isFT(token) ? (
            <Amount
              value={availableTokenBalance}
              suffix={token.symbol}
              decimals={token.decimals}
              medium
              color="tertiary"
            />
          ) : (
            <Amount value={availableTokenBalance} isUnknownToken medium color="tertiary" />
          )
        ) : undefined
      }
      icon={isNFT(token) ? <NFTThumbnail nftId={tokenId} size={32} /> : <AssetLogo assetId={tokenId} size={32} />}
    />
  )
}

export default TokenRow
