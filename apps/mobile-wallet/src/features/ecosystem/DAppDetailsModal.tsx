import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { openBrowserAsync } from 'expo-web-browser'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Image as RNImage } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { dAppQuery } from '~/api/queries/dAppQueries'
import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import DAppDetailsModalHeader from '~/features/ecosystem/DAppDetailsModalHeader'
import { DAppProps } from '~/features/ecosystem/ecosystemTypes'
import VisitDAppButton from '~/features/ecosystem/VisitDAppButton'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { BORDER_RADIUS_BIG, VERTICAL_GAP } from '~/style/globalStyle'

const DAppDetailsModal = memo<DAppProps>(({ dAppName }) => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()

  const handleOpenAlphLand = () => openBrowserAsync(`https://www.alph.land/${dAppName.replace(' ', '-').toLowerCase()}`)

  return (
    <BottomModal2 notScrollable title={<DAppDetailsModalHeader dAppName={dAppName} />} titleAlign="left">
      <Content>
        <DAppBannerImage dAppName={dAppName} />
        <DAppDetailsModalDescription dAppName={dAppName} />
        <BottomButtons backgroundColor="back1" fullWidth>
          <Button
            title={t('More details on Alph.land')}
            onPress={handleOpenAlphLand}
            iconProps={{ name: 'open-outline' }}
          />
          <VisitDAppButton
            dAppName={dAppName}
            onVisitDappButtonPress={dismissModal}
            buttonType="default"
            variant="contrast"
          />
        </BottomButtons>
      </Content>
    </BottomModal2>
  )
})

export default DAppDetailsModal

const FALLBACK_ASPECT_RATIO = 16 / 9

const DAppBannerImage = ({ dAppName }: DAppProps) => {
  const { data: dApp } = useQuery(dAppQuery(dAppName))
  const theme = useTheme()

  const [imageAspectRatio, setImageAspectRatio] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (dApp?.media.bannerUrl) {
      try {
        RNImage.getSize(dApp.media.bannerUrl, (width, height) => {
          setImageAspectRatio(width / height)
          setIsLoading(false)
        })
      } catch (error) {
        setImageAspectRatio(FALLBACK_ASPECT_RATIO)
        setIsLoading(false)
      }
    }
  }, [dApp?.media.bannerUrl])

  if (!dApp) return null

  if (isLoading) return <ActivityIndicator color={theme.font.primary} />

  return <DAppCoverImage source={{ uri: dApp.media.bannerUrl }} aspectRatio={imageAspectRatio} contentFit="cover" />
}

const DAppDetailsModalDescription = ({ dAppName }: DAppProps) => {
  const { data: dApp } = useQuery(dAppQuery(dAppName))

  if (!dApp) return null

  return (
    <DAppDetailsModalDescriptionStyled>
      <LeftAlignedText>{dApp.description}</LeftAlignedText>
    </DAppDetailsModalDescriptionStyled>
  )
}

// TODO: DRY (TokenDetailsModalDescription)
const DAppDetailsModalDescriptionStyled = styled(EmptyPlaceholder)`
  margin-top: ${VERTICAL_GAP}px;
  justify-content: flex-start;
`

const LeftAlignedText = styled(AppText)`
  align-self: flex-start;
`

// TODO: DRY
const Content = styled.View`
  padding-top: ${VERTICAL_GAP / 2}px;
`

const DAppCoverImage = styled(Image)<{ aspectRatio: number }>`
  width: 100%;
  aspect-ratio: ${({ aspectRatio }) => aspectRatio};
  border-radius: ${BORDER_RADIUS_BIG}px;
`
