import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useAppDispatch } from '@/store/hooks';
import {
    setUsers,
    updateUser,
    updateUserStatus,
    setLoading,
    setError,
} from '@/services/users/userSlice';
import { queryKeys } from '@/lib/constants/queryKeys';

interface User {
    id: string;
    username: string;
    email?: string;
    role: 'approver' | 'assistant' | 'admin';
    fullName?: string;
    mobileNo?: string;
    isActive?: boolean;
    createdAt?: string;
}

interface ApiResponse {
    status: boolean;
    message: string;
    data: {
        users?: User[];
        user?: User;
    };
}

interface ApiError {
    message: string;
    statusCode: number;
}

interface SendCredentialsData {
    username: string;
    email: string;
    password: string;
}

interface UpdateProfileData {
    username: string;
    email?: string;
    fullName?: string;
    mobileNo?: string;
    password?: string;
}

interface SetUserStatusData {
    username: string;
    isActive: boolean;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getUsers = async (): Promise<User[]> => {
    const response = await axios.get<ApiResponse>(
        `${BASE_URL}/api/user/get-users`,
        { withCredentials: true }
    );
    return response.data.data.users || [];
};

const sendCredentials = async (data: SendCredentialsData): Promise<void> => {
    await axios.post(`${BASE_URL}/api/user/send-credentials`, data, {
        withCredentials: true,
    });
};

const updateProfile = async (data: UpdateProfileData): Promise<User> => {
    const response = await axios.post<ApiResponse>(
        `${BASE_URL}/api/user/update-profile`,
        data,
        { withCredentials: true }
    );
    return response.data.data.user!;
};

const setUserStatus = async (data: SetUserStatusData): Promise<void> => {
    await axios.post(`${BASE_URL}/api/user/set-user-status`, data, {
        withCredentials: true,
    });
};

const signoutAll = async (): Promise<void> => {
    await axios.post(
        `${BASE_URL}/api/user/signout-all`,
        {},
        { withCredentials: true }
    );
};

export const useUserApi = () => {
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();

    // Query for fetching users
    const usersQuery = useQuery({
        queryKey: queryKeys.users?.all || ['users'],
        queryFn: getUsers,
        staleTime: 300000, // 5 minutes
        retry: 2,
    });

    // Update Redux when query data changes
    if (usersQuery.data) {
        dispatch(setUsers(usersQuery.data));
    }

    if (usersQuery.isLoading) {
        dispatch(setLoading());
    }

    if (usersQuery.error) {
        const msg =
            (usersQuery.error as AxiosError<ApiError>)?.response?.data?.message ||
            (usersQuery.error as Error).message;
        dispatch(setError(msg));
    }

    // Mutation for sending credentials
    const sendCredentialsMutation = useMutation<
        void,
        AxiosError<ApiError>,
        SendCredentialsData
    >({
        mutationFn: sendCredentials,
        onError: (error) => {
            const msg =
                (error as AxiosError<ApiError>)?.response?.data?.message ||
                (error as Error).message;
            dispatch(setError(msg));
        },
    });

    // Mutation for updating profile
    const updateProfileMutation = useMutation<
        User,
        AxiosError<ApiError>,
        UpdateProfileData
    >({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            dispatch(updateUser(data));
            queryClient.invalidateQueries({
                queryKey: queryKeys.users?.all || ['users'],
            });
        },
        onError: (error) => {
            const msg =
                (error as AxiosError<ApiError>)?.response?.data?.message ||
                (error as Error).message;
            dispatch(setError(msg));
        },
    });

    // Mutation for setting user status
    const setUserStatusMutation = useMutation<
        void,
        AxiosError<ApiError>,
        SetUserStatusData
    >({
        mutationFn: setUserStatus,
        onMutate: async (data) => {
            // Optimistic update
            dispatch(updateUserStatus(data));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.users?.all || ['users'],
            });
        },
        onError: (error) => {
            const msg =
                (error as AxiosError<ApiError>)?.response?.data?.message ||
                (error as Error).message;
            dispatch(setError(msg));
            // Refetch to restore correct state
            queryClient.invalidateQueries({
                queryKey: queryKeys.users?.all || ['users'],
            });
        },
    });

    // Mutation for signing out all devices
    const signoutAllMutation = useMutation<void, AxiosError<ApiError>>({
        mutationFn: signoutAll,
        onError: (error) => {
            const msg =
                (error as AxiosError<ApiError>)?.response?.data?.message ||
                (error as Error).message;
            console.log('Signout all failed', msg);
        },
    });

    return {
        // Query data
        users: usersQuery.data || [],
        isLoadingUsers: usersQuery.isLoading,
        usersError: usersQuery.error,
        refetchUsers: usersQuery.refetch,

        // Mutations
        sendCredentials: sendCredentialsMutation.mutate,
        sendCredentialsAsync: sendCredentialsMutation.mutateAsync,
        isSendingCredentials: sendCredentialsMutation.isPending,
        sendCredentialsError: sendCredentialsMutation.error,

        updateProfile: updateProfileMutation.mutate,
        updateProfileAsync: updateProfileMutation.mutateAsync,
        isUpdatingProfile: updateProfileMutation.isPending,
        updateProfileError: updateProfileMutation.error,

        setUserStatus: setUserStatusMutation.mutate,
        setUserStatusAsync: setUserStatusMutation.mutateAsync,
        isSettingUserStatus: setUserStatusMutation.isPending,
        setUserStatusError: setUserStatusMutation.error,

        signoutAll: signoutAllMutation.mutate,
        signoutAllAsync: signoutAllMutation.mutateAsync,
        isSigningOutAll: signoutAllMutation.isPending,
        signoutAllError: signoutAllMutation.error,
    };
};