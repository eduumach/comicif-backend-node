import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import Layout from "./components/layout/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from "./pages/Home"
import Prompts from "./pages/Prompts"
import Gallery from "./pages/Gallery"
import Generate from "./pages/Generate"
import Login from "./pages/Login"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="prompts"
              element={
                <ProtectedRoute>
                  <Prompts />
                </ProtectedRoute>
              }
            />
            <Route path="gallery" element={<Gallery />} />
            <Route
              path="generate"
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
