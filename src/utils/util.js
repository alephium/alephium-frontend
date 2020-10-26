// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { ExplorerClient } from "./explorer";
import { useEffect, useRef } from 'react';

export async function createClient() {
  let address = process.env.REACT_APP_ALEPHIUM_HOST;
  if (!address) { address = 'localhost'; }

  let port = process.env.REACT_APP_ALEPHIUM_PORT;
  if (!port) { port = 9090; }

  const client = new ExplorerClient({
    host: address,
    port: port
  });

  console.log('Connecting to: ' + client.host + ':' + client.port);

  return client;
}

export function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}