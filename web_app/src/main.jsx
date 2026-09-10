import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import { initGlobalErrorLogging } from './utils/api'

// Инициализация глобального отслеживания JS-ошибок интерфейса для журнала Администратора
initGlobalErrorLogging();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

