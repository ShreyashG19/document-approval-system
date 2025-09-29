import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/services/auth/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface AuthGuardProps {
  roles?: Array<'approver' | 'assistant' | 'admin'>;
  redirectTo?: string;
}

const AuthGuard = ({ roles, redirectTo = '/auth' }: AuthGuardProps) => {
  const { user, isAuthenticated, status } = useAuth();

  if (status === 'loading') return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  // If user is authenticated but doesn't have required role,
  // send them to a generic home (could be role-specific later).
  if (roles && user?.role && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;