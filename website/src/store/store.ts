import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '@/services/auth/authSlice';
import encryptionReducer from '@/services/encryption/encryptionSlice'
import documentReducer from "@/services/documents/documentSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        encryption: encryptionReducer,
        documents: documentReducer
    },
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
