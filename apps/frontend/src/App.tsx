import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Home from "./pages/Home"
import Prompts from "./pages/Prompts"
import Gallery from "./pages/Gallery"
import Generate from "./pages/Generate"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="prompts" element={<Prompts />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="generate" element={<Generate />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
