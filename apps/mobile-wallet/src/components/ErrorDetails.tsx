import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'

interface ErrorDetailsProps {
  details: string
}

const ErrorDetails = ({ details }: ErrorDetailsProps) => {
  const { t } = useTranslation()
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <DetailsToggle onPress={() => setShowDetails((v) => !v)} hitSlop={6}>
        <AppText size={12} color="accent" semiBold>
          {showDetails ? t('Hide details') : t('Show details')}
        </AppText>
      </DetailsToggle>
      {showDetails && (
        <DetailsBox>
          <AppText size={11} color="primary">
            {details}
          </AppText>
        </DetailsBox>
      )}
    </>
  )
}

export default ErrorDetails

const DetailsToggle = styled.Pressable`
  align-self: flex-start;
  margin-top: 6px;
`

const DetailsBox = styled.View`
  margin-top: 8px;
  padding: 10px;
`
