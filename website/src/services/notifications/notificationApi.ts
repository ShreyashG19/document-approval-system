import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useAppDispatch } from '@/store/hooks';
import {
    setNotifications,
    markAllAsSeen,
    setLoading,
    setError,
} from '@/services/notifications/notificationSlice';
import { queryKeys } from '@/lib/constants/queryKeys';

interface Notification {
    id: string;
    message: string;
    createdAt: string;
    seen?: boolean;
}

interface ApiResponse {
    status: boolean;
    message: string;
    data: {
        notifications?: Notification[];
    };
}

interface ApiError {
    message: string;
    statusCode: number;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getNotifications = async (): Promise<Notification[]> => {
    const response = await axios.get<ApiResponse>(
        `${BASE_URL}/api/notification/get-notifications`,
        { withCredentials: true }
    );
    return response.data.data.notifications || [];
};

const markNotificationsAsSeen = async (): Promise<void> => {
    await axios.post(
        `${BASE_URL}/api/notification/mark-seen`,
        {},
        { withCredentials: true }
    );
};

export const useNotificationApi = () => {
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();

    // Query for fetching notifications
    const notificationsQuery = useQuery({
        queryKey: queryKeys.notifications?.all || ['notifications'],
        queryFn: getNotifications,
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // Refetch every minute
        retry: 2,
    });

    // Update Redux when query data changes
    if (notificationsQuery.data) {
        dispatch(setNotifications(notificationsQuery.data));
    }

    if (notificationsQuery.isLoading) {
        dispatch(setLoading());
    }

    if (notificationsQuery.error) {
        const msg =
            (notificationsQuery.error as AxiosError<ApiError>)?.response?.data?.message ||
            (notificationsQuery.error as Error).message;
        dispatch(setError(msg));
    }

    // Mutation for marking notifications as seen
    const markSeenMutation = useMutation<void, AxiosError<ApiError>>({
        mutationFn: markNotificationsAsSeen,
        onMutate: async () => {
            // Optimistic update
            dispatch(markAllAsSeen());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.notifications?.all || ['notifications'],
            });
        },
        onError: (error) => {
            const msg =
                (error as AxiosError<ApiError>)?.response?.data?.message ||
                (error as Error).message;
            dispatch(setError(msg));
            // Refetch to restore correct state
            queryClient.invalidateQueries({
                queryKey: queryKeys.notifications?.all || ['notifications'],
            });
        },
    });

    return {
        // Query data
        notifications: notificationsQuery.data || [],
        isLoadingNotifications: notificationsQuery.isLoading,
        notificationsError: notificationsQuery.error,
        refetchNotifications: notificationsQuery.refetch,

        // Mutations
        markAsSeen: markSeenMutation.mutate,
        markAsSeenAsync: markSeenMutation.mutateAsync,
        isMarkingSeen: markSeenMutation.isPending,
        markSeenError: markSeenMutation.error,
    };
};