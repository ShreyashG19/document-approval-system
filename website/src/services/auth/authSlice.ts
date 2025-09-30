import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
    id?: string;
    username: string;
    email?: string;
    role: 'approver' | 'assistant' | 'admin';
    fullName?: string;
    mobileNo?: string;
    isActive?: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    status: 'idle',
    error: null,
};

// const initialState: AuthState = {
//     user:
//         import.meta.env.DEV
//             ? {
//                   id: 'dummy123',
//                   username: 'dummyuser',
//                   email: 'dummy@example.com',
//                   role: 'admin',
//               }
//             : null,
//     token: !import.meta.env.DEV ? 'dummy-token-123' : null,
//     status: 'idle',
//     error: null,
// };

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.status = 'loading';
        },
        loginSuccess: (state, action: PayloadAction<{ user: User; token?: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token ?? null;
            state.status = 'idle';
        },
        loginFailure: (state) => {
            state.status = 'failed';
            // state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
