import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Notification {
    id: string;
    message: string;
    createdAt: string;
    seen?: boolean;
}

interface NotificationState {
    notifications: Notification[];
    unseenCount: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: NotificationState = {
    notifications: [],
    unseenCount: 0,
    status: 'idle',
    error: null,
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<Notification[]>) => {
            state.notifications = action.payload;
            state.unseenCount = action.payload.filter((n) => !n.seen).length;
            state.status = 'succeeded';
        },
        markAllAsSeen: (state) => {
            state.notifications = state.notifications.map((n) => ({
                ...n,
                seen: true,
            }));
            state.unseenCount = 0;
        },
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.seen) {
                state.unseenCount += 1;
            }
        },
        setLoading: (state) => {
            state.status = 'loading';
        },
        setError: (state, action: PayloadAction<string>) => {
            state.status = 'failed';
            state.error = action.payload;
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unseenCount = 0;
            state.status = 'idle';
            state.error = null;
        },
    },
});

export const {
    setNotifications,
    markAllAsSeen,
    addNotification,
    setLoading,
    setError,
    clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;