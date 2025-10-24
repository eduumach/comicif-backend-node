import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import Layout from "./components/layout/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from "./pages/Home"
import Prompts from "./pages/Prompts"
import Gallery from "./pages/Gallery"
import Generate from "./pages/Generate"
import Login from "./pages/Login"
import EventCarousel from "./pages/EventCarousel"
import Roulette from "./pages/Roulette"
import OriginalPhotos from "./pages/OriginalPhotos"

function App() {
  return (
    <ThemeProvider>
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
                  <ProtectedRoute requireAdmin>
                    <Roulette />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/prompts"
                element={
                  <ProtectedRoute requireAdmin>
                    <Prompts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/generate"
                element={
                  <ProtectedRoute requireAdmin>
                    <Generate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="original-photos"
                element={
                  <ProtectedRoute>
                    <OriginalPhotos />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
