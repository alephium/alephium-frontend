import Tooltip from '@/components/Tooltip'

const Tooltips = () => (
  <>
    <Tooltip id="default" delayShow={0} />
    <Tooltip id="sidenav" place="right" />
    <Tooltip id="copy" place="bottom" />
  </>
)

export default Tooltips
