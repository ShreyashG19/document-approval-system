import { useAppSelector } from '@/store/hooks';
import {
    selectCurrentUser,
    selectCurrentToken,
    selectAuthStatus,
    selectAuthError,
    selectIsAuthenticated,
} from './authSelectors';
import { useAuthApi } from '@/services/auth/authApi';

export const useAuth = () => {
    // Get state from Redux
    const user = useAppSelector(selectCurrentUser);
    const token = useAppSelector(selectCurrentToken);
    const status = useAppSelector(selectAuthStatus);
    const error = useAppSelector(selectAuthError);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    // Get API operations from authApi
    const api = useAuthApi();

    return {
        // State
        user,
        token,
        isAuthenticated,
        status,
        error,

        // API operations
        login: api.login,
        loginAsync: api.loginAsync,
        register: api.register,
        registerAsync: api.registerAsync,
        logout: api.logout,
        logoutAsync: api.logoutAsync,

        // Loading states
        isLoggingIn: api.isLoggingIn,
        isRegistering: api.isRegistering,
        isLoggingOut: api.isLoggingOut,

        // Errors
        loginError: api.loginError,
        registerError: api.registerError,
        logoutError: api.logoutError,
    };
};
