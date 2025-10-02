import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '@/services/auth/authSlice';
import encryptionReducer from '@/services/encryption/encryptionSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        encryption: encryptionReducer,
    },
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
