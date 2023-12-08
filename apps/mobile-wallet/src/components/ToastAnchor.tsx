/*
Copyright 2018 - 2023 The Alephium Authors
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

import Toast, { BaseToastProps, ErrorToast, InfoToast, SuccessToast } from 'react-native-toast-message'

const toastConfig: BaseToastProps = {
  text1NumberOfLines: 10,
  text2NumberOfLines: 10,
  text1Style: { fontSize: 14 },
  text2Style: { fontSize: 12 }
}

const ToastAnchor = () => (
  <Toast
    config={{
      info: (props) => <InfoToast {...toastConfig} {...props} />,
      success: (props) => <SuccessToast {...toastConfig} {...props} />,
      error: (props) => <ErrorToast {...toastConfig} {...props} />
    }}
  />
)

export default ToastAnchor
