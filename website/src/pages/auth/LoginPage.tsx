    import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginStart, loginSuccess, loginFailure } from '@/services/auth/authSlice'
import { requestFCMToken } from '@/utils/firebaseUtils'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [deviceToken, setDeviceToken] = useState('web-token')
  const [error, setError] = useState<string | null>(null)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const authUser = useAppSelector((s) => s.auth.user)

  useEffect(() => {
    // If already logged in, redirect based on role
    if (authUser?.role) {
      if (authUser.role === 'approver') navigate('/approver', { replace: true })
      else if (authUser.role === 'assistant') navigate('/assistant', { replace: true })
      else if (authUser.role === 'admin') navigate('/admin', { replace: true })
      else navigate('/', { replace: true })
    }
  }, [authUser, navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    dispatch(loginStart())
    // Request FCM token for this device (best-effort)
    try {
      const token = await requestFCMToken()
      if (token) setDeviceToken(token)
    } catch (err) {
      console.warn('FCM token not available', err)
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, deviceToken }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data?.message || 'Login failed')
        dispatch(loginFailure())
        return
      }

      // Backend returns user object in data.user and sets cookie token
  dispatch(loginSuccess({ user: { username: data.user.username, email: data.user.email, role: data.user.role, fullName: data.user.fullName, mobileNo: data.user.mobileNo, isActive: data.user.isActive } }))

      // navigate based on role
      if (data.user.role === 'approver') navigate('/approver')
      else if (data.user.role === 'assistant') navigate('/assistant')
      else if (data.user.role === 'admin') navigate('/admin')
      else navigate('/')
    } catch (err: any) {
      setError(err?.message || 'Login failed')
      dispatch(loginFailure())
    }
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6 border rounded">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="p-2 border" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="p-2 border" />
        <input value={deviceToken} onChange={(e) => setDeviceToken(e.target.value)} placeholder="Device Token" className="p-2 border" />
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  )
}

export default LoginPage