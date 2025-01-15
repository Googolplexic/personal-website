import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { Portfolio } from './pages/Portfolio'
import { Origami } from './pages/Origami'

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen w-screen transition-all duration-200">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 pt-24 pb-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/portfolio/*" element={<Portfolio />} />
                        <Route path="/origami" element={<Origami />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    )
}

export default App
