import BaseToast from 'react-native-toast-message'

import Toast from '~/components/toasts/Toast'

const ToastAnchor = () => (
  <BaseToast
    config={{
      info: (props) => <Toast {...props} type="info" />,
      success: (props) => <Toast text1={props.text1} {...props} type="success" />,
      error: (props) => <Toast {...props} type="error" />
    }}
    position="top"
  />
)

export default ToastAnchor
