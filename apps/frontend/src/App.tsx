import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import Layout from "./components/layout/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from "./pages/Home"
import Prompts from "./pages/Prompts"
import Gallery from "./pages/Gallery"
import Generate from "./pages/Generate"
import Login from "./pages/Login"
import EventCarousel from "./pages/EventCarousel"
import Roulette from "./pages/Roulette"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/event-carousel" element={<EventCarousel />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Gallery />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="home" element={<Home />} />
            <Route
              path="roulette"
              element={
                <ProtectedRoute>
                  <Roulette />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/prompts"
              element={
                <ProtectedRoute>
                  <Prompts />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/generate"
              element={
                <ProtectedRoute>
                  <Generate />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
