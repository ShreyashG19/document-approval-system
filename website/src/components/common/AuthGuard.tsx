import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectIsAuthenticated, selectCurrentUser, selectAuthStatus } from '@/services/auth/authSelectors'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface AuthGuardProps {
  roles?: Array<'approver' | 'assistant' | 'admin'>
  redirectTo?: string
}

const AuthGuard = ({ roles, redirectTo = '/auth' }: AuthGuardProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectCurrentUser)
  const status = useAppSelector(selectAuthStatus)
  const location = useLocation()
  const navigate = useNavigate()

  const homePath = useMemo(() => {
    // Map role to its landing page. Defaults to pending documents for unknown roles.
    const role = user?.role
    if (role === 'admin') return '/admin'
    if (role === 'assistant') return '/assistant'
    if (role === 'approver') return '/approver'
    return '/pending'
  }, [user?.role])

  useEffect(() => {
    // If logged in and tries to go to /auth → send to role-appropriate home
    if (isAuthenticated && location.pathname.startsWith('/auth')) {
      navigate(homePath, { replace: true })
    }
  }, [isAuthenticated, location.pathname, navigate, homePath])

  if (status === 'loading') return <LoadingSpinner />

  // If not authenticated → go to login page
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const unauthorized = Boolean(roles && user?.role && !roles.includes(user.role))

  // If authenticated but role is not allowed -> send to role home (effect)
  useEffect(() => {
    if (unauthorized) {
      navigate(homePath, { replace: true })
    }
  }, [unauthorized, navigate, homePath])

  if (unauthorized) return null

  return <Outlet />
}

export default AuthGuard
