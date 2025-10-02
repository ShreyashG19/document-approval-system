import { type RootState } from '@/store/store';
import { createSelector } from '@reduxjs/toolkit';

export const selectNotificationState = (state: RootState) => state.notification;

export const selectNotifications = (state: RootState) => state.notification.notifications;
export const selectUnseenCount = (state: RootState) => state.notification.unseenCount;
export const selectNotificationStatus = (state: RootState) => state.notification.status;
export const selectNotificationError = (state: RootState) => state.notification.error;

// Memoized selectors
export const selectHasUnseenNotifications = createSelector(
    [selectUnseenCount],
    (count) => count > 0
);

export const selectUnseenNotifications = createSelector(
    [selectNotifications],
    (notifications) => notifications.filter((n) => !n.seen)
);

export const selectSeenNotifications = createSelector(
    [selectNotifications],
    (notifications) => notifications.filter((n) => n.seen)
);

export const selectNotificationLoadingState = createSelector(
    [selectNotificationStatus],
    (status) => status === 'loading'
);