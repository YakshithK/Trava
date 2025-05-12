import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from "../context/authContext"

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/" replace />

  return <>{children}</>
}

export default ProtectedRoute
