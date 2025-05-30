import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import logo from '@/images/alephium-not-found.svg'

const InlineErrorMessage = ({ message, code }: { message?: string; code?: number }) => {
  const { t } = useTranslation()

  let shownMessage = ''

  if (!message) {
    shownMessage = t("Something's wrong")
  } else {
    // Clean the error message by removing details that could be used to trick users
    const regex = /\(([^()]|\([^()]*\))*\)/g
    shownMessage = message.replace(regex, '')
  }

  return (
    <ErrorWrapper>
      <Container>
        <ErrorLogo />
        <ErrorMessageContainer>
          <ErrorCode>{code}</ErrorCode>
          <ErrorMessage>{shownMessage}</ErrorMessage>
        </ErrorMessageContainer>
      </Container>
    </ErrorWrapper>
  )
}

const ErrorWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 100px;
`

const Container = styled.div`
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 14px;
  padding: 35px 25px;
  display: flex;
  flex-direction: column;
  width: 100%;
`

const ErrorLogo = styled.div`
  background-image: url(${logo});
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  min-height: 150px;
  max-height: 300px;
  height: 25%;
  width: 100%;
  margin-bottom: 25px;
`

const ErrorMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 25px;
  text-align: center;
`

const ErrorCode = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
`

const ErrorMessage = styled.span`
  max-width: 500px;
  width: 100%;
  color: ${({ theme }) => theme.font.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
`

export default InlineErrorMessage
