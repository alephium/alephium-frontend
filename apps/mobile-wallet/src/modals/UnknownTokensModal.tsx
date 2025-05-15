import { useFetchWalletTokensByType } from '@alephium/shared-react'
import Ionicons from '@expo/vector-icons/Feather'
import { FlashList } from '@shopify/flash-list'
import * as Clipboard from 'expo-clipboard'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import ListItem from '~/components/ListItem'
import BottomModalFlashList from '~/features/modals/BottomModalFlashList'
import withModal from '~/features/modals/withModal'
import { showToast } from '~/utils/layout'

const UnknownTokensModal = withModal(({ id }) => {
  const { t } = useTranslation()
  const theme = useTheme()

  const {
    data: { nstIds }
  } = useFetchWalletTokensByType({ includeHidden: false })

  const handleCopyPress = (tokenId: string) => {
    Clipboard.setStringAsync(tokenId)
    showToast({ text1: t('Token ID copied!') })
  }

  return (
    <BottomModalFlashList
      modalId={id}
      title={t('unknownTokensKey', { count: nstIds.length })}
      flashListRender={(props) => (
        <FlashList
          data={nstIds}
          estimatedItemSize={65}
          ListHeaderComponent={
            <AppText>
              {t(
                'These tokens in your wallet do not respect the Alephium token standards. No information about them could be found.'
              )}
            </AppText>
          }
          renderItem={({ item: tokenId, index }) => (
            <ListItem
              key={tokenId}
              title={tokenId}
              isLast={index === nstIds.length - 1}
              icon={<Ionicons name="help-circle" size={24} color={theme.font.secondary} />}
              onLongPress={() => handleCopyPress(tokenId)}
            />
          )}
          {...props}
        />
      )}
    />
  )
})

export default UnknownTokensModal
