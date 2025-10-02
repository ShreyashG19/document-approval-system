import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess, loginFailure, logout } from '@/services/auth/authSlice';
import { clearCache } from '@/services/encryption/encryptionSlice'
import { queryKeys } from '../../lib/constants/queryKeys';

interface User {
    id?: string;
    username: string;
    email?: string;
    role: 'approver' | 'assistant' | 'admin';
    fullName?: string;
    mobileNo?: string;
    isActive?: boolean;
}

interface AuthResponse {
    user: User;
    token?: string;
    role: 'approver' | 'assistant' | 'admin';
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData extends LoginCredentials {
    name: string;
}

interface ApiError {
    message: string;
    statusCode: number;
}

const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const response = await axios.post<AuthResponse>(`${base}/api/auth/login`, credentials, { withCredentials: true });
    return response.data;
};

const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const response = await axios.post<AuthResponse>(`${base}/api/auth/register`, userData, { withCredentials: true });
    return response.data;
};

const logoutUser = async (): Promise<void> => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    await axios.post(`${base}/api/auth/logout`, {}, { withCredentials: true });
};

export const useAuthApi = () => {
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();

    const loginMutation = useMutation<AuthResponse, AxiosError<ApiError>, LoginCredentials>({
        mutationFn: loginUser,
        onSuccess: (data: AuthResponse) => {
            dispatch(loginSuccess({ user: data.user, token: data.token }));
            queryClient.invalidateQueries({
                queryKey: queryKeys.auth.currentUser,
            });
            queryClient.removeQueries({
                queryKey: queryKeys.cart.all,
            });
        },
        onError: (error: AxiosError<ApiError> | unknown) => {
            dispatch(loginFailure());
            const msg = (error as AxiosError<ApiError>)?.response?.data?.message || (error as Error).message;
            console.log('Login failed', msg);
        },
    });

    const registerMutation = useMutation<AuthResponse, AxiosError<ApiError>, RegisterData>({
        mutationFn: registerUser,
        onSuccess: (data: AuthResponse) => {
            dispatch(loginSuccess({ user: data.user, token: data.token }));
            queryClient.invalidateQueries({
                queryKey: queryKeys.auth.currentUser,
            });
        },
        onError: (error: AxiosError<ApiError> | unknown) => {
            dispatch(loginFailure());
            const msg = (error as AxiosError<ApiError>)?.response?.data?.message || (error as Error).message;
            console.log('Register failed', msg);
        },
    });

    const logoutMutation = useMutation<void, AxiosError<ApiError>>({
        mutationFn: logoutUser,
    onMutate: async () => {
            //optimistic update
            dispatch(logout());
            await queryClient.cancelQueries();

            //clear all cached queries except configurations
            queryClient.clear();
            // clear any client-side persisted tokens and encryption cache
            try {
                localStorage.removeItem('token')
                localStorage.removeItem('deviceToken')
            } catch (e) {
                console.warn('Failed to remove localStorage items during logout', e)
            }
            try {
                dispatch(clearCache())
            } catch (e) {
                console.warn('Failed to clear encryption cache', e)
            }
        },
        onError: (error: AxiosError<ApiError> | unknown) => {
            const msg = (error as AxiosError<ApiError>)?.response?.data?.message || (error as Error).message;
            console.log('Logout failed', msg);
        },
        onSettled: async () => {
            // try to unregister firebase service worker if present
            try {
                if ('serviceWorker' in navigator) {
                    const reg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
                    if (reg) await reg.unregister()
                }
            } catch (e) {
                console.warn('Failed to unregister service worker during logout', e)
            }
        },
    });

    return {
        login: loginMutation.mutate,
        loginAsync: loginMutation.mutateAsync,
        register: registerMutation.mutate,
        registerAsync: registerMutation.mutateAsync,
        logout: logoutMutation.mutate,
        logoutAsync: logoutMutation.mutateAsync,
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
        loginError: loginMutation.error,
        registerError: registerMutation.error,
        logoutError: logoutMutation.error,
    };
};
