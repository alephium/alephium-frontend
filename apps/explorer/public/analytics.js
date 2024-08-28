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

// Created as a separate script to avoid inline scripts due to CSP
if (window.location.host === 'explorer.alephium.org') {
  const s = document.createElement('script')
  s.setAttribute('type', 'text/javascript')
  s.setAttribute('async', '')
  s.setAttribute('src', 'https://gc.zgo.at/count.js')
  s.setAttribute('data-goatcounter', 'https://alephium-explorer.goatcounter.com/count')
  document.body.appendChild(s)
}
