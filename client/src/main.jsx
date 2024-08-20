import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './sass/main.scss';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SocketProvider } from './content/socketContext.jsx';
import Room from './components/Room.jsx';
import { PeerProvider } from './content/PeerContext.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  }, {
    path: '/room/:roomID/:emailId',
    element:
      <>
        <SocketProvider>
          <PeerProvider>
            <Room />
          </PeerProvider>
        </SocketProvider>
      </>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
