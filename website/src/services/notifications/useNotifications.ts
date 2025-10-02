import { useAppSelector } from '@/store/hooks';
import {
    selectNotifications,
    selectUnseenCount,
    selectNotificationStatus,
    selectNotificationError,
    selectHasUnseenNotifications,
    selectUnseenNotifications,
    selectSeenNotifications,
} from '@/services/notifications/notificationSelector';
import { useNotificationApi } from './notificationApi';

export const useNotification = () => {
    // Get state from Redux
    const notifications = useAppSelector(selectNotifications);
    const unseenCount = useAppSelector(selectUnseenCount);
    const status = useAppSelector(selectNotificationStatus);
    const error = useAppSelector(selectNotificationError);
    const hasUnseen = useAppSelector(selectHasUnseenNotifications);
    const unseenNotifications = useAppSelector(selectUnseenNotifications);
    const seenNotifications = useAppSelector(selectSeenNotifications);

    // Get API operations
    const api = useNotificationApi();

    return {
        // State
        notifications,
        unseenCount,
        hasUnseen,
        unseenNotifications,
        seenNotifications,
        status,
        error,

        // API operations
        markAsSeen: api.markAsSeen,
        markAsSeenAsync: api.markAsSeenAsync,
        refetchNotifications: api.refetchNotifications,

        // Loading states
        isLoadingNotifications: api.isLoadingNotifications,
        isMarkingSeen: api.isMarkingSeen,

        // Errors
        markSeenError: api.markSeenError,
    };
};