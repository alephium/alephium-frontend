import styled from 'styled-components'

const PlaceholderText = styled.div`
  flex: 1;
  padding: 30px;
  margin: 20px 0;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.tertiary};
  background-color: ${({ theme }) => theme.bg.tertiary};
  border-radius: var(--radius-big);
`

export default PlaceholderText
