import React, { useMemo } from 'react'
import {io} from 'Socket.io-client';
import JoinRoom from './components/JoinRoom';

function App() {
  const socket = useMemo(() => (io("http://localhost:3000")),[]);
  console.log(socket.id);
  return (
    <JoinRoom />
  )
}

export default App;