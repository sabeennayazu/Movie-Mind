import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { authService } from './services/api'

// Components
import Navbar from './components/Navbar'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MovieDetail from './pages/MovieDetail'
import Favorites from './pages/Favorites'
import Watchlist from './pages/Watchlist'
import Recommendations from './pages/Recommendations'
import Search from './pages/Search'
import Profile from './pages/Profile'

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.getCurrentUser()

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children
}

function App() {
  useEffect(() => {
    // Add custom theme handling if needed
    document.body.classList.add('bg-gray-900')
  }, [])

  return (
    <Provider store={store}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />

          <main className="flex-grow pb-12">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/movies/:id" element={<MovieDetail />} />
              <Route path="/search" element={<Search />} />

              {/* Protected routes */}
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/watchlist"
                element={
                  <ProtectedRoute>
                    <Watchlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <footer className="bg-gray-900 border-t border-gray-800 py-6 mt-12">
            <div className="container mx-auto px-4 text-center text-gray-400">
              <p>Movie Recommendation App {new Date().getFullYear()}</p>
            </div>
          </footer>
        </div>
      </Router>
    </Provider>
  )
}

export default App
