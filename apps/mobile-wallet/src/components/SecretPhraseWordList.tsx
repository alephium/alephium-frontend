/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { colord } from 'colord'
import { usePreventScreenCapture } from 'expo-screen-capture'
import { Pressable } from 'react-native'
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'
import styled, { DefaultTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'

interface SecretPhraseWordListProps {
  words: SelectedWord[]
  onWordPress?: (word: SelectedWord) => void
  showEmptyListMessage?: boolean
  color?: GlobalColor
}

type GlobalColor = keyof DefaultTheme['global']

export type SelectedWord = {
  word: string
  timestamp: Date
}

const SecretPhraseWordList = ({
  words,
  onWordPress,
  showEmptyListMessage,
  color = 'accent'
}: SecretPhraseWordListProps) => {
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
              color={color}
            >
              <AppText color={color} bold>
                {index + 1}. {word.word}
              </AppText>
            </SelectedWordBox>
          ))
        : showEmptyListMessage && <AppText color="secondary">Start entering your phrase... 👇</AppText>}
    </SecretPhraseWordListStyled>
  )
}

export default SecretPhraseWordList

const SecretPhraseWordListStyled = styled.View`
  padding: 15px;
  flex-direction: row;
  flex-wrap: wrap;
`

export const WordBox = styled(Animated.createAnimatedComponent(Pressable))`
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 7px 10px;
  margin: 0 10px 10px 0;
  border-radius: ${BORDER_RADIUS_SMALL}px;
`

export const SelectedWordBox = styled(WordBox)<{ color: GlobalColor }>`
  background-color: ${({ theme, color }) => colord(theme.global[color]).alpha(0.2).toHex()};
`
