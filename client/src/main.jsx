import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import ForgetPassword from './components/ForgetPassword.jsx';
import ResetPasswordPage from './components/ResetPassword.jsx';
import EmailSent from './components/EmailSent.jsx';
import LoginPage from './components/LoginPage.jsx';
import AboutPage from './components/Students/About.jsx';
import ApplicationPage from './components/Students/Application.jsx';

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
  { path: '/admin/sessions', element: <App /> },
  { path: '/admin/calender', element: <App /> },
  { path: '/admin/calendar', element: <App /> },
  { path: '/admin/profile', element: <App /> },
  // Students pages
  { path: '/students/about', element: <AboutPage /> },
  { path: '/students/application', element: <ApplicationPage /> },

]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
