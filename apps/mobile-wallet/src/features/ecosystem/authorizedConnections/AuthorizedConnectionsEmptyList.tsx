import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import EmptyPlaceholder, { EmptyPlaceholderProps } from '~/components/EmptyPlaceholder'

const AuthorizedConnectionsEmptyList = (props: EmptyPlaceholderProps) => {
  const { t } = useTranslation()

  return (
    <EmptyPlaceholder style={{ flexGrow: 0 }} {...props}>
      <AppText size={32}>🔌</AppText>
      <AppText>{t('There are no connections yet.')}</AppText>
    </EmptyPlaceholder>
  )
}

export default AuthorizedConnectionsEmptyList
