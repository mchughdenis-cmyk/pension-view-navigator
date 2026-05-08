import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RoleProvider } from './contexts/RoleContext'
import { ThemeProvider } from './contexts/ThemeContext'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <RoleProvider>
      <App />
    </RoleProvider>
  </ThemeProvider>
);
