import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import ForgetPassword from './components/ForgetPassword.jsx';
import ResetPasswordPage from './components/ResetPasswordPage.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/forgot-password",
    element: <ForgetPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPasswordPage />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
