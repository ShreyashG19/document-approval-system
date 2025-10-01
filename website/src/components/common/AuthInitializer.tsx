import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAppDispatch } from '@/store/hooks'
import { loginSuccess } from '@/services/auth/authSlice'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:4000'
        const resp = await axios.get(`${base}/api/auth/get-session`, { withCredentials: true })
        const respBody = resp.data

        // Normalize user location (same as LoginPage)
        const userFromBody =
          respBody?.data?.data ?? respBody?.data ?? respBody?.user ?? respBody

        if (mounted && userFromBody && userFromBody.role) {
          const userObj = {
            username: userFromBody.username,
            email: userFromBody.email,
            role: userFromBody.role,
            fullName: userFromBody.fullName,
            mobileNo: userFromBody.mobileNo,
            isActive: userFromBody.isActive,
          }
          dispatch(loginSuccess({ user: userObj }))
          console.info('Restored session for user', userObj.username)
        }
      } catch (err: any) {
        console.info('No existing session or session check failed', err?.message ?? err)
      } finally {
        if (mounted) setReady(true)
      }
    }

    checkSession()

    return () => {
      mounted = false
    }
  }, [dispatch])

  if (!ready) return <LoadingSpinner />
  return <>{children}</>
}
