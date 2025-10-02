import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useMemo } from "react"
import { useAppSelector } from "@/store/hooks"
import {
  selectIsAuthenticated,
  selectCurrentUser,
  selectAuthStatus,
} from "@/services/auth/authSelectors"
import LoadingSpinner from "@/components/common/LoadingSpinner"

interface AuthGuardProps {
  roles?: Array<"approver" | "assistant" | "admin">
  redirectTo?: string
}

const AuthGuard = ({ roles, redirectTo = "/auth" }: AuthGuardProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectCurrentUser)
  const status = useAppSelector(selectAuthStatus)
  const location = useLocation()
  const navigate = useNavigate()

  // Role → default home path
  const homePath = useMemo(() => {
    const role = user?.role
    if (role === "admin") return "/admin-home"
    if (role === "assistant") return "/assistant-home"
    if (role === "approver") return "/approver-home"
    return "/pending"
  }, [user?.role])

  // Redirect if authenticated but on /auth
  useEffect(() => {
    if (isAuthenticated && location.pathname.startsWith("/auth")) {
      navigate(homePath, { replace: true })
    }
  }, [isAuthenticated, location.pathname, navigate, homePath])

  const unauthorized = Boolean(
    roles && user?.role && !roles.includes(user.role)
  )

  // Redirect if authenticated but role not allowed
  useEffect(() => {
    if (unauthorized) {
      navigate(homePath, { replace: true })
    }
  }, [unauthorized, navigate, homePath])

  // ---- Conditional rendering after hooks are declared ----
  if (status === "loading") return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />
  if (unauthorized) return <Navigate to={homePath} replace />

  return <Outlet />
}

export default AuthGuard
