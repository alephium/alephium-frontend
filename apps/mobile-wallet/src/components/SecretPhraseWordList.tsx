import { usePreventScreenCapture } from 'expo-screen-capture'
import { useTranslation } from 'react-i18next'
import { Pressable, PressableProps } from 'react-native'
import Animated, { AnimatedProps, FadeIn, FadeOut, Layout } from 'react-native-reanimated'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'

interface SecretPhraseWordListProps {
  words: SelectedWord[]
  onWordPress?: (word: SelectedWord) => void
  showEmptyListMessage?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export type SelectedWord = {
  word: string
  timestamp: Date
}

const SecretPhraseWordList = ({ words, onWordPress, showEmptyListMessage }: SecretPhraseWordListProps) => {
  const { t } = useTranslation()

  usePreventScreenCapture()

  return (
    <SecretPhraseWordListStyled>
      {words.length > 0
        ? words.map((word, index) => (
            <SelectedWordBox
              key={`${word.word}-${word.timestamp}`}
              onPress={onWordPress ? () => onWordPress(word) : undefined}
              entering={FadeIn}
              exiting={FadeOut}
              layout={Layout.duration(200).delay(200)}
            >
              <WordText semiBold>
                {index + 1}. {word.word}
              </WordText>
            </SelectedWordBox>
          ))
        : showEmptyListMessage && <AppText color="secondary">{t('Start entering your phrase')}... 👇</AppText>}
    </SecretPhraseWordListStyled>
  )
}

export const WordBox = (props: AnimatedProps<PressableProps>) => <StyledWordBox hitSlop={10} {...props} />

export default SecretPhraseWordList

const SecretPhraseWordListStyled = styled.View`
  padding: 15px;
  flex-direction: row;
  flex-wrap: wrap;
`

const WordText = styled(AppText)`
  color: ${({ theme }) => theme.font.contrast};
`

export const StyledWordBox = styled(AnimatedPressable)`
  background-color: ${({ theme }) => theme.bg.contrast};
  padding: 8px 12px;
  margin: 0 10px 10px 0;
  border-radius: 100px;
`

export const SelectedWordBox = styled(WordBox)`
  background-color: ${({ theme }) => theme.bg.contrast};
`
