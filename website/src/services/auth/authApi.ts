import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess, loginFailure, logout } from '@/services/auth/authSlice';
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
    const response = await axios.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
};

const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/api/auth/register', userData);
    return response.data;
};

const logoutUser = async (): Promise<void> => {
    await axios.post('/api/auth/logout');
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
        },
        onError: (error: AxiosError<ApiError> | unknown) => {
            const msg = (error as AxiosError<ApiError>)?.response?.data?.message || (error as Error).message;
            console.log('Logout failed', msg);
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
