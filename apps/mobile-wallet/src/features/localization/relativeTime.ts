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

type RelativeTimeEntries = {
  future: string
  past: string
  s: string
  m: string
  mm: string
  h: string
  hh: string
  d: string
  dd: string
  M: string
  MM: string
  y: string
  yy: string
}

// See https://day.js.org/docs/en/customization/customization
// and https://github.com/iamkun/dayjs/tree/dev/src/locale
export const shortRelativeTime: Record<string, RelativeTimeEntries> = {
  en: {
    future: 'in %s',
    past: '%s ago',
    s: 'some sec',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1mo',
    MM: '%dmo',
    y: '1y',
    yy: '%dy'
  },
  el: {
    future: 'σε %s',
    past: 'πριν %s',
    s: 'μερικά δ.',
    m: '1λ',
    mm: '%dλ',
    h: '1 ώρα',
    hh: '%d ώρες',
    d: '1 μέρα',
    dd: '%d μέρες',
    M: '1 μήνα',
    MM: '%d μήνες',
    y: '1 χρ.',
    yy: '%d χρ.'
  }
}
