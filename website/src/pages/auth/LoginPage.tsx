import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginStart, loginSuccess, loginFailure } from '@/services/auth/authSlice'
import { requestFCMToken } from '@/utils/firebaseUtils'
import axios from 'axios'
import { Role } from '@/utils/enum'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [deviceToken, setDeviceToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const authUser = useAppSelector((s) => s.auth.user)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ username: '', password: '' })

  // Redirect if already logged in — depend only on the role value to avoid re-running
  const location = useLocation()
  const navigatedForRole = useRef<string | null>(null)

  useEffect(() => {
    const role = authUser?.role
    if (!role) {
      // clear previous navigation lock when user is not authenticated
      navigatedForRole.current = null
      return
    }

    // If we've already navigated for this role, don't navigate again
    if (navigatedForRole.current === role) return

    const target =
      role === Role.APPROVER ? '/approver' : role === Role.ASSISTANT ? '/assistant' : role === Role.ADMIN ? '/admin' : '/'

    // only navigate if we're not already at the target path (prevents loops)
    if (location.pathname !== target) {
      navigatedForRole.current = role
      navigate(target, { replace: true })
    }
  }, [authUser?.role, navigate, location.pathname])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({ username: '', password: '' })

    // client-side validation
    if (!username.trim()) return setFieldErrors((s) => ({ ...s, username: 'Username is required' }))
    if (/\s/.test(username)) return setFieldErrors((s) => ({ ...s, username: 'Username cannot include spaces' }))
    if (!password.trim()) return setFieldErrors((s) => ({ ...s, password: 'Password is required' }))
    if (/\s/.test(password)) return setFieldErrors((s) => ({ ...s, password: 'Password cannot include spaces' }))
    if (password.length < 8) return setFieldErrors((s) => ({ ...s, password: 'Password must be at least 8 characters' }))

    setLoading(true)
    dispatch(loginStart())

    // Generate FCM token
    let token: string | null = null
    try {
      token = await requestFCMToken()
      if (token) setDeviceToken(token)
      console.log('FCM token generated:', token)
    } catch (err: any) {
      console.warn('FCM token not available', err?.message ?? err)
    }

    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const resp = await axios.post(
        `${base}/api/auth/login`,
        { username, password, deviceToken: token ?? deviceToken },
        { withCredentials: true }
      )

  const respBody = resp.data
  console.debug('Login response (raw):', respBody)
      // Support multiple backend shapes. Example response shape seen:
      // { status, message, data: { data: { ...user } } }
      const userFromBody =
        respBody?.data?.data ?? // nested data.data
        respBody?.data ?? // { data: { ... } } or user directly under data
        respBody?.user ??
        respBody

      const userObj = {
        username: userFromBody.username,
        email: userFromBody.email,
        role: userFromBody.role,
        fullName: userFromBody.fullName,
        mobileNo: userFromBody.mobileNo,
        isActive: userFromBody.isActive,
      }

  console.info('Login response user resolved as:', userObj)

  dispatch(loginSuccess({ user: userObj }))

  // Let the role-based useEffect handle navigation after the store updates.
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Login failed')
      dispatch(loginFailure())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6 border rounded">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="p-2 border w-full"
            aria-invalid={!!fieldErrors.username}
          />
          {fieldErrors.username && <div className="text-red-600 text-sm">{fieldErrors.username}</div>}
        </div>

        <div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="p-2 border w-full"
              aria-invalid={!!fieldErrors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-sm"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {fieldErrors.password && <div className="text-red-600 text-sm">{fieldErrors.password}</div>}
        </div>

        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded flex items-center justify-center"
        >
          {loading ? (
            <>
              <span className="loading loading-spinner" />
              <span className="ml-2">Logging in...</span>
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </div>
  )
}

export default LoginPage