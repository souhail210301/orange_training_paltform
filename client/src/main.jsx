import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import ForgetPassword from './components/ForgetPassword.jsx';
import ResetPasswordPage from './components/ResetPassword.jsx';
import EmailSent from './components/EmailSent.jsx';
import LoginPage from './components/LoginPage.jsx';


const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgetPassword /> },
  { path: '/reset-password/:token', element: <ResetPasswordPage /> },
  { path: '/email-sent', element: <EmailSent /> },
  // Admin pages
  { path: '/admin/dashboard', element: <App /> },
  { path: '/admin/users', element: <App /> },
  { path: '/admin/catalogue', element: <App /> },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
