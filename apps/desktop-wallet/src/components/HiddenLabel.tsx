import styled from 'styled-components'

interface HiddenLabelProps {
  text: string
}

const HiddenLabel = ({ text, ...props }: HiddenLabelProps) => <div {...props}>{text}</div>

export default styled(HiddenLabel)`
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
`
