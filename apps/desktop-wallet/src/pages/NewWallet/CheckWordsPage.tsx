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

import { dangerouslyConvertUint8ArrayMnemonicToString } from '@alephium/shared-crypto'
import { colord } from 'colord'
import { motion, PanInfo } from 'framer-motion'
import { throttle } from 'lodash'
import { AlertTriangle, ThumbsUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import {
  FloatingPanel,
  FooterActionsContainer,
  PanelContentContainer,
  Section
} from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import Paragraph from '@/components/Paragraph'
import { useStepsContext } from '@/contexts/steps'
import { useWalletContext } from '@/contexts/wallet'

interface WordKey {
  word: string
  key: string // Used to build layout and ensure anims are working when duplicates exist
}

const CheckWordsPage = () => {
  const { t } = useTranslation()
  const { onButtonBack, onButtonNext } = useStepsContext()
  const { mnemonic } = useWalletContext()

  const [wordList, setWordList] = useState<WordKey[]>([])
  const [selectedElements, setSelectedElements] = useState<{ [wordKey: string]: Element | null }>({})
  const [selectedWords, setSelectedWords] = useState<WordKey[]>([])
  const [isValid, setIsValid] = useState(false)

  // === Drag interaction ===
  const [isDragging, setIsDragging] = useState(false)
  const [closestWordKey, setClosestWordKey] = useState<string>('')

  useEffect(() => {
    if (!mnemonic) return

    setWordList(
      getAlphabeticallyOrderedList(mnemonic.toString().split(' ')).map((wordString, i) => ({
        word: wordString,
        key: `${wordString}-${i}`
      }))
    )

    setSelectedElements(
      mnemonic
        .toString()
        .split(' ')
        .reduce((p, c) => ({ ...p, [c]: null }), {})
    )
  }, [mnemonic])

  useEffect(() => {
    if (!mnemonic) return

    setIsValid(
      selectedWords.map(({ word }) => word).join(' ') === dangerouslyConvertUint8ArrayMnemonicToString(mnemonic)
    )
  }, [mnemonic, selectedWords])

  // === Actions ===
  // ===============
  const handleSelectedWordRemove = (w: WordKey) => {
    if (isDragging) {
      setIsDragging(false)
      return
    }
    setSelectedWords(selectedWords.filter((word) => w.key !== word.key))

    // Remove from element list
    selectedElements[w.key] = null
  }

  const handleSelectedWordDrag = throttle(
    (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
      word: WordKey,
      currentSelectedElements: typeof selectedElements
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [word.key]: _currentElement, ...otherElements } = currentSelectedElements
      const closestElement = Object.values(otherElements).reduce(
        (p, c, i) => {
          // Distance
          let returnedObject

          if (c) {
            const rect = c.getBoundingClientRect()
            const distance = Math.hypot(rect.x - info.point.x, rect.y - info.point.y)

            if (p.distance === 0) {
              returnedObject = {
                wordKey: Object.keys(otherElements)[i],
                element: c,
                distance: distance
              }
            } else if (distance < p.distance) {
              returnedObject = {
                wordKey: Object.keys(otherElements)[i],
                element: c,
                distance: distance
              }
            } else {
              returnedObject = p
            }
          } else {
            returnedObject = p
          }

          return returnedObject
        },
        {
          wordKey: '',
          element: null as Element | null,
          distance: 0
        }
      )

      setClosestWordKey(closestElement.wordKey)
    },
    300
  )

  const handleSelectedWordDragEnd = (word: WordKey, newNeighbourWordKey: string) => {
    // Find neighbour index
    if (closestWordKey) {
      const currentIndex = selectedWords.findIndex((w) => w.key === word.key)
      let newIndex = selectedWords.findIndex((w) => w.key === newNeighbourWordKey)
      if (currentIndex < newIndex) {
        newIndex -= 1
      }

      const filteredWords = selectedWords.filter((w) => w.key !== word.key)
      setSelectedWords([...filteredWords.slice(0, newIndex), word, ...filteredWords.slice(newIndex)])
      setClosestWordKey('')
    }
  }

  // === Renders

  const renderRemainingWords = () =>
    wordList
      .filter((w) => !selectedWords?.includes(w))
      .map((w) => (
        <RemainingWord onClick={() => setSelectedWords([...selectedWords, w])} key={w.key} layoutId={w.key}>
          {w.word}
        </RemainingWord>
      ))

  const renderSelectedWords = () =>
    selectedWords?.map((w) => (
      <SelectedWord
        onPointerUp={() => handleSelectedWordRemove(w)}
        key={w.key}
        layoutId={w.key}
        drag
        ref={(element) => {
          if (selectedElements && element) selectedElements[w.key] = element
        }}
        onDragStart={() => setIsDragging(true)}
        onDrag={(e, info) => handleSelectedWordDrag(e, info, w, selectedElements)}
        onDragEnd={() => handleSelectedWordDragEnd(w, closestWordKey)}
      >
        {isDragging && closestWordKey === w.key && <DragCursor layoutId="cursor" />}
        {w.word}
      </SelectedWord>
    ))

  const handleNextButtonPress = () => {
    cleanup()
    onButtonNext()
  }

  const handleBackButtonPress = () => {
    cleanup()
    onButtonBack()
  }

  const cleanup = () => {
    setWordList([])
    setSelectedElements({})
    setSelectedWords([])
  }

  return (
    <FloatingPanel enforceMinHeight>
      <PanelTitle color="primary" onBackButtonClick={onButtonBack} size="small">
        {t('Security Check')}
      </PanelTitle>
      <PanelContentContainer>
        <Section>
          <Paragraph>{t('Select the words in the right order.')}</Paragraph>
          <SelectedWordList className={selectedWords.length === wordList.length ? (isValid ? 'valid' : 'error') : ''}>
            {renderSelectedWords()}
          </SelectedWordList>
          <RemainingWordList>{renderRemainingWords()}</RemainingWordList>
        </Section>
      </PanelContentContainer>
      {selectedWords.length === wordList.length ? (
        !isValid ? (
          <InfoBox
            Icon={AlertTriangle}
            importance="alert"
            text={t(
              "It seems like you made a mistake in the words' order. But don't worry, you can reorder the words by dragging them around."
            )}
          />
        ) : (
          <InfoBox
            small
            Icon={ThumbsUp}
            importance="accent"
            text={t('Great job! Remember to keep those words safe.')}
          />
        )
      ) : null}
      {selectedWords.length === wordList.length && (
        <FooterActionsContainer>
          <Button role="secondary" onClick={handleBackButtonPress}>
            {t('Cancel')}
          </Button>
          <Button onClick={handleNextButtonPress} disabled={!isValid}>
            {t('Continue')}
          </Button>
        </FooterActionsContainer>
      )}
    </FloatingPanel>
  )
}

const getAlphabeticallyOrderedList = (arr: string[]) => arr.slice().sort()

export default CheckWordsPage

const RemainingWordList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: var(--spacing-4) 0;
  flex: 1;
  align-items: flex-start;
  justify-content: flex-start;
  align-content: flex-start;
`

const SelectedWord = styled(motion.button)`
  padding: 6px var(--spacing-2);
  border-radius: 5px;
  background-color: ${({ theme }) => theme.global.accent};
  color: ${({ theme }) => theme.font.contrastPrimary};
  font-weight: var(--fontWeight-medium);
  text-align: center;
  margin-bottom: var(--spacing-2);
  position: relative;
  cursor: pointer;

  &:not(:last-child) {
    margin-right: var(--spacing-2);
  }

  &:hover {
    background-color: ${({ theme }) => colord(theme.global.accent).alpha(0.8).toRgbString()};
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px ${({ theme }) => colord(theme.global.accent).darken(20).toRgbString()};
  }
`

const DragCursor = styled(motion.div)`
  position: absolute;
  left: -7px;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: ${({ theme }) => theme.global.accent};
`

const SelectedWordList = styled(Box)`
  width: 100%;
  padding: var(--spacing-4);
  min-height: 200px;
  margin-bottom: var(--spacing-4);

  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
  align-content: flex-start;

  &.valid {
    ${SelectedWord} {
      background-color: ${({ theme }) => theme.global.valid};
    }
  }

  &.error {
    ${SelectedWord} {
      background-color: ${({ theme }) => theme.global.alert};
    }
  }
`

const RemainingWord = styled(SelectedWord)`
  background-color: ${({ theme }) => theme.global.accent};
  background-color: ${({ theme }) => colord(theme.global.accent).alpha(0.1).toRgbString()};
  color: ${({ theme }) => theme.global.accent};

  &:hover {
    background-color: ${({ theme }) => colord(theme.global.accent).alpha(0.3).toRgbString()};
  }
`
