import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginPage from './components/LoginPage' // Import the LoginPage component
import RegisterPage from './components/RegisterPage'; // Import RegisterPage
import AdminDashboard from './components/AdminDashboard'; // Import AdminDashboard

function App() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('')
  const [showLogin, setShowLogin] = useState(true); // State to control login page visibility
  const [userRole, setUserRole] = useState(null); // State to store user role

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error("Error fetching data:", err))
  }, [])

  const handleLoginSuccess = (role) => {
    setShowLogin(false);
    setUserRole(role); // Set the user role
  };

  return (
    <>
      {showLogin ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {userRole === 'admin' ? (
            <AdminDashboard />
          ) : (
            <>
              <button onClick={() => setShowLogin(true)}>Show Login</button>
              <button onClick={() => setShowLogin(false)}>Show Register</button>
              {/* Conditionally render RegisterPage or the original App content */}
              {/* For now, we'll just show RegisterPage when not showing login */}
              <RegisterPage />
            </>
          )}
        </>
      )}
    </>
  )
}

export default App
