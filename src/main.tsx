import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'  // Remove .tsx extension
import { ThemeProvider } from './components/layout/ThemeProvider'

// Console greeting for the curious
if (typeof window !== 'undefined') {
  const styles = {
    banner: 'color:#c9a84c;font-size:14px;font-weight:bold;font-family:monospace;line-height:1.4',
    info: 'color:#e8e4de;font-size:11px;font-family:monospace',
    link: 'color:#c9a84c;font-size:11px;font-family:monospace;text-decoration:underline',
  }
  console.log(
    '%c\n' +
    '   ╔═══════════════════════════════════╗\n' +
    '   ║                                   ║\n' +
    '   ║      C O L E M A N   L A I        ║\n' +
    '   ║     My gallery of code & paper    ║\n' +
    '   ║                                   ║\n' +
    '   ╚═══════════════════════════════════╝\n',
    styles.banner
  )
  console.log(
    '%cHello there! \nCurious how this gallery was built?\n',
    styles.info
  )
  console.log(
    '%c→ github.com/Googolplexic/personal-website\n→ /humans.txt\n',
    styles.link
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
