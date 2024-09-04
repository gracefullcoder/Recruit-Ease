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
import { Auth0Provider } from '@auth0/auth0-react';
import UserDashboard from './components/dashboard/UserDashBoard.jsx';
import TemplateForm from "./components/dashboard/TemplateForm.jsx";
import UserInterviews from './components/dashboard/UserInterviews.jsx';
import UserTemplates from './components/dashboard/UserTemplates.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/dashboard",
    element: <UserDashboard />,
    children: [
      {
        path: "interviews",
        element: <UserInterviews />
      }, {
        path: "templates",
        element: <UserTemplates />
      }
      , {
        path: "template/update",
        element: <TemplateForm />
      }
    ]
  },
  {
    path: '/room/:roomId',
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

  <Auth0Provider
    domain={import.meta.env.VITE_AUTH_DOMAIN}
    clientId={import.meta.env.VITE_AUTH_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <ToastContainer
      style={{ width: "100%", padding: "2rem", maxWidth: "50rem", textAlign: "center", fontSize: "1.5rem" }}
      limit={3}
      closeOnClick
      draggable
      pauseOnHover
      theme="light"
      transition:Bounce
    />
    <RouterProvider router={router} />

  </Auth0Provider>

)
