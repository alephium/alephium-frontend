import { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { TextInput, TextInputProps } from 'react-native'
import styled, { css, useTheme } from 'styled-components/native'

import Button from '~/components/buttons/Button'

interface SearchInputProps extends TextInputProps {
  isInModal?: boolean
}

const SearchInput = ({ isInModal, ...props }: SearchInputProps) => {
  const { t } = useTranslation()
  const theme = useTheme()

  const handleClearPress = () => {
    props.onChangeText?.('')
  }

  return (
    <SearchInputStyled>
      {isInModal ? (
        <BottomSheetInputStyled placeholder={t('Search')} placeholderTextColor={theme.font.tertiary} {...props} />
      ) : (
        <TextInputStyled placeholder={t('Search')} placeholderTextColor={theme.font.tertiary} {...props} />
      )}

      {props.value && (
        <ClearButtonContainer>
          <Button iconProps={{ name: 'close' }} onPress={handleClearPress} squared compact variant="transparent" />
        </ClearButtonContainer>
      )}
    </SearchInputStyled>
  )
}

export default SearchInput

const SearchInputStyled = styled.View`
  position: relative;
  align-items: center;
  width: 100%;
`

const ClearButtonContainer = styled.View`
  position: absolute;
  right: 4px;
  height: 100%;
  align-items: center;
  justify-content: center;
`

const InputStyles = css<{ value?: string }>`
  width: 100%;
  background-color: ${({ theme }) => theme.bg.highlight};
  padding: 12px 14px;
  border-radius: 100px;
  color: ${({ theme }) => theme.font.primary};

  ${({ value }) =>
    value &&
    css`
      padding-right: 52px;
    `};
`

const TextInputStyled = styled(TextInput)`
  ${InputStyles}
`

const BottomSheetInputStyled = styled(BottomSheetTextInput)`
  ${InputStyles}
`
