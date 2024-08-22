import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './sass/main.scss';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SocketProvider } from './content/socketContext.jsx';
import Room from './components/Room.jsx';
import { PeerProvider } from './content/PeerContext.jsx';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  }, {
    path: '/room/:roomId/:emailId',
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

  <>
   <ToastContainer
        style={{ width: "100%", padding: "2rem", maxWidth: "50rem", textAlign: "center",fontSize:"1.5rem" }}
        limit={3}
        closeOnClick
        draggable
        pauseOnHover
        theme="light"
        transition:Bounce
      />

    <RouterProvider router={router} />
  </>
)
