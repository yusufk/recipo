import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Layout from './components/Layout'
import Home from './pages/Home'
import Recipe from './pages/Recipe'
import Submit from './pages/Submit'
import Edit from './pages/Edit'
import Login from './pages/Login'
import UserRecipes from './pages/UserRecipes'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/recipe/:category/:slug" element={<Recipe />} />
          <Route path="/edit/:category/:slug" element={<Edit />} />
          <Route path="/user/:username" element={<UserRecipes />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
