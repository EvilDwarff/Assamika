import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./assets/css/style.css";
import { AdminAuthProvider } from './components/context/AdminAuth.jsx';
import { AuthProvider } from './components/context/Auth.jsx';
import App from './App'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminAuthProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AdminAuthProvider>
  </StrictMode>
)
