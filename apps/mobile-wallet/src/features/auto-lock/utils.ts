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

const autoLockSeconds = [5, 15, 30, 60]

export const autoLockSecondsOptions = [
  {
    label: 'Fast',
    value: 0
  },
  ...autoLockSeconds.map((sec) => ({
    label: `${sec} seconds`,
    value: sec
  })),
  {
    label: 'Never',
    value: -1
  }
]

export const getAutoLockLabel = (autoLockSeconds: number) =>
  autoLockSecondsOptions.find((option) => option.value === autoLockSeconds)?.label
