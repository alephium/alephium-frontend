import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'

interface EmptyTokensListPlaceholdersProps {
  isLoading: boolean
  isEmpty: boolean
}

const EmptyTokensListPlaceholders = ({ isLoading, isEmpty }: EmptyTokensListPlaceholdersProps) => {
  const { t } = useTranslation()

  if (isLoading)
    return (
      <EmptyPlaceholder>
        <AppText size={32}>⏳</AppText>
        <AppText>{t('Loading your balances...')}</AppText>
      </EmptyPlaceholder>
    )

  if (isEmpty)
    return (
      <EmptyPlaceholder>
        <AppText size={32}>👀</AppText>
        <AppText>{t('No assets here, yet.')}</AppText>
      </EmptyPlaceholder>
    )
}

export default EmptyTokensListPlaceholders
