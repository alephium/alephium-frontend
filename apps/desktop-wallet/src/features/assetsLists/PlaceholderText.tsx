import styled from 'styled-components'

const PlaceholderText = styled.div`
  padding: 30px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.tertiary};
`

export default PlaceholderText
