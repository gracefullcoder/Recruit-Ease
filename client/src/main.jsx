import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './sass/main.scss';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SocketProvider } from './content/socketContext.jsx';
import JoinRoom from './components/JoinRoom.jsx';
import Room from './components/Room.jsx';
import { PeerProvider } from './content/PeerContext.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  }, {
    path: '/room/:roomId/:emailId',
    element: <Room />
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <SocketProvider>
    <PeerProvider>
      <RouterProvider router={router} />
    </PeerProvider>
  </SocketProvider>
  // </React.StrictMode>
)
