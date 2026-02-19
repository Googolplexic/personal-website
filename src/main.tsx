import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/grape-nuts/latin-400.css'
import '@fontsource/grape-nuts/latin-ext-400.css'
import '@fontsource/eb-garamond/latin-400.css'
import '@fontsource/eb-garamond/latin-ext-400.css'
import '@fontsource/eb-garamond/latin-500.css'
import '@fontsource/eb-garamond/latin-ext-500.css'
import '@fontsource/eb-garamond/latin-600.css'
import '@fontsource/eb-garamond/latin-ext-600.css'
import '@fontsource/eb-garamond/latin-400-italic.css'
import '@fontsource/eb-garamond/latin-ext-400-italic.css'
import '@fontsource/eb-garamond/latin-500-italic.css'
import '@fontsource/eb-garamond/latin-ext-500-italic.css'
import '@fontsource/pt-sans/latin-400.css'
import '@fontsource/pt-sans/latin-ext-400.css'
import './index.css'
import App from './App'  // Remove .tsx extension
import { ThemeProvider } from './components/layout/ThemeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
