import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./assets/css/style.css";
import './components/Header'
import App from './App'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>
  </StrictMode>,
)
