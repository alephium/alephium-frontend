import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import { getValidUrl } from '~/features/ecosystem/ecosystemUtils'
import RootStackParamList from '~/navigation/rootStackRoutes'

const OpenUrlButton = ({ url }: { url: string }) => {
  const { t } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const dAppUrl = useMemo(() => getValidUrl(url), [url])

  if (!dAppUrl) return null

  const openDappBrowser = () => navigation.navigate('DAppWebViewScreen', { dAppUrl, dAppName: '' })

  return (
    <Button
      compact
      title={t('Visit website')}
      onPress={openDappBrowser}
      iconProps={{ name: 'open-outline' }}
      variant="accent"
    />
  )
}

export default OpenUrlButton
