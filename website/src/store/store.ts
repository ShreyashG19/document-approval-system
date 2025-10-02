import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '@/services/auth/authSlice';
import encryptionReducer from '@/services/encryption/encryptionSlice';
import documentReducer from '@/services/documents/documentSlice';
import notificationReducer from '@/services/notifications/notificationSlice';
import departmentReducer from '@/services/departments/departmentSlice';
import userReducer from '@/services/users/userSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        encryption: encryptionReducer,
        documents: documentReducer,
        notification: notificationReducer,
        department: departmentReducer,
        user: userReducer,
    },
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;