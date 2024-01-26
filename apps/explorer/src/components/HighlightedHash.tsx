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

import styled from 'styled-components'

import ClipboardButton from './Buttons/ClipboardButton'
import TextMiddleEllipsis from './TextMiddleEllipsis'

interface HighlightedHashProps {
  text: string
  textToCopy?: string
  middleEllipsis?: boolean
  fontSize?: number
  maxWidth?: string
  className?: string
}

const HighlightedHash = ({
  text,
  textToCopy,
  middleEllipsis = false,
  fontSize = 14,
  maxWidth = 'auto',
  className
}: HighlightedHashProps) => (
  <div style={{ fontSize, maxWidth, wordBreak: middleEllipsis ? 'initial' : 'break-all' }} className={className}>
    {middleEllipsis ? <TextMiddleEllipsis text={text} /> : text}
    {textToCopy && (
      <ButtonWrapper>
        <ClipboardButton textToCopy={textToCopy} />
      </ButtonWrapper>
    )}
  </div>
)

export default styled(HighlightedHash)`
  display: flex;
  background: ${({ theme }) => theme.global.highlight};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
`

const ButtonWrapper = styled.div`
  flex-shrink: 0;
`
