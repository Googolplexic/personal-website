import './App.css'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { Navbar } from './components/Navbar'
import { Skills } from './components/Skills'

function App() {
  return (
    <div className="min-h-screen w-screen transition-all duration-200">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">Coleman Lai</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Not a Full Stack Developer</p>
        </header>

        <main>
          <About />
          <Skills />
          <Contact />
        </main>
      </div>
    </div>
  )
}

export default App
