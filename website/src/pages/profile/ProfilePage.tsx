import { useAppSelector } from '@/store/hooks'
import { selectCurrentUser } from '@/services/auth/authSelectors'

export default function ProfilePage() {
  const user = useAppSelector(selectCurrentUser)

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Profile</h2>
      {user ? (
        <div className="space-y-2">
          <div><strong>Full name:</strong> {user.fullName || user.username}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Role:</strong> {user.role}</div>
          <div><strong>Mobile:</strong> {user.mobileNo || '—'}</div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No user information available.</p>
      )}
    </div>
  )
}
