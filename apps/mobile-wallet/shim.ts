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
require('react-native-get-random-values')
if (typeof BigInt === 'undefined') global.BigInt = require('big-integer')
if (typeof TextEncoder === 'undefined') global.TextEncoder = require('text-encoding').TextEncoder
if (typeof TextDecoder === 'undefined') global.TextDecoder = require('text-encoding').TextDecoder
