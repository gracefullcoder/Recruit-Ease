import React, { useMemo } from 'react'
import {io} from 'Socket.io-client';

function App() {
  const socket = useMemo(() => (io("http://localhost:3000")),[]);
  console.log(socket.id);
  return (
    <div>App</div>
  )
}

export default App;