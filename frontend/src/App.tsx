// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Accomplishments from './pages/Accomplishments';
import Contact from './pages/Contact';
import ClientPortal from './pages/ClientPortal';
import Header from './components/Header'; // Keep Header/Footer here so they appear on all sections

function App() {
  return (
    <BrowserRouter>
      <div className="font-sans">
        <Header />
        <main className="pt-32">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Home />
                  <About />
                  <Services />
                  <Portfolio />
                  <Accomplishments />
                  <Contact />
                </>
              }
            />
            <Route path="/client-portal" element={<ClientPortal />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App;
