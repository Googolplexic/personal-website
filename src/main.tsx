import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'  // Remove .tsx extension
import { ThemeProvider } from './components/layout/ThemeProvider'

// Console greeting for the curious — delayed so it appears after framework logs
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log(
      '%c  C O L E M A N   L A I  ',
      'color:#ffffff;background:#0a0a0a;font-size:20px;font-family:Georgia,serif;padding:16px 24px 4px;border-top:1px solid #c9a84c;border-left:1px solid #c9a84c;border-right:1px solid #c9a84c;letter-spacing:0.15em;line-height:2'
    )
    console.log(
      '%c My Gallery of Code & Paper  ',
      'color:#c9a84c;background:#0a0a0a;font-size:12px;font-family:Georgia,serif;padding:4px 47.4px 16px;border-bottom:1px solid #c9a84c;border-left:1px solid #c9a84c;border-right:1px solid #c9a84c;letter-spacing:0.1em;font-style:italic;line-height:2'
    )
    console.log(
      '%c  Hello there! I see you sneaking around the console. You\'re probably looking for the following:',
      'color:#c5c0bb;font-size:11px;font-family:system-ui,sans-serif;line-height:2.2'
    )
    console.log(
      '%c  ◈ Source    %chttps://github.com/Googolplexic/personal-website',
      'color:#a9a29b;font-size:11px;font-family:system-ui,sans-serif;line-height:2.2',
      'color:#c9a84c;font-size:11px;font-family:system-ui,sans-serif'
    )
    console.log(
      '%c  ◈ Credits   %chttps://www.colemanlai.com/humans.txt',
      'color:#a9a29b;font-size:11px;font-family:system-ui,sans-serif;line-height:2.2',
      'color:#c9a84c;font-size:11px;font-family:system-ui,sans-serif'
    )
    console.log(
      '%c  ◈ Stack     %cReact · TypeScript · Vite · Tailwind',
      'color:#a9a29b;font-size:11px;font-family:system-ui,sans-serif;line-height:2.2',
      'color:#a9a29b;font-size:11px;font-family:system-ui,sans-serif'
    )
  }, 2000)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
