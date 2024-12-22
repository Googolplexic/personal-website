import { useState } from 'react'
import './App.css'
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="h-screen w-screen transition-all duration-200 flex flex-col justify-center">
      <ThemeToggle />
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}
          className="bg-gray-200 dark:bg-gray-800">
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs dark:text-gray-400">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
