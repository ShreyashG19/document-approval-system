import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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

interface UserState {
    users: User[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: UserState = {
    users: [],
    status: 'idle',
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUsers: (state, action: PayloadAction<User[]>) => {
            state.users = action.payload;
            state.status = 'succeeded';
        },
        addUser: (state, action: PayloadAction<User>) => {
            state.users.push(action.payload);
        },
        updateUser: (state, action: PayloadAction<User>) => {
            const index = state.users.findIndex(
                (user) => user.id === action.payload.id
            );
            if (index !== -1) {
                state.users[index] = action.payload;
            }
        },
        updateUserStatus: (
            state,
            action: PayloadAction<{ username: string; isActive: boolean }>
        ) => {
            const user = state.users.find(
                (u) => u.username === action.payload.username
            );
            if (user) {
                user.isActive = action.payload.isActive;
            }
        },
        removeUser: (state, action: PayloadAction<string>) => {
            state.users = state.users.filter((user) => user.id !== action.payload);
        },
        setLoading: (state) => {
            state.status = 'loading';
        },
        setError: (state, action: PayloadAction<string>) => {
            state.status = 'failed';
            state.error = action.payload;
        },
        clearUsers: (state) => {
            state.users = [];
            state.status = 'idle';
            state.error = null;
        },
    },
});

export const {
    setUsers,
    addUser,
    updateUser,
    updateUserStatus,
    removeUser,
    setLoading,
    setError,
    clearUsers,
} = userSlice.actions;

export default userSlice.reducer;