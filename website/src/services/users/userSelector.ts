import { type RootState } from '@/store/store';
import { createSelector } from '@reduxjs/toolkit';

export const selectUserState = (state: RootState) => state.user;

export const selectUsers = (state: RootState) => state.user.users;
export const selectUserStatus = (state: RootState) => state.user.status;
export const selectUserError = (state: RootState) => state.user.error;

// Memoized selectors
export const selectUserCount = createSelector(
    [selectUsers],
    (users) => users.length
);

export const selectUserById = (userId: string) =>
    createSelector([selectUsers], (users) =>
        users.find((user) => user.id === userId)
    );

export const selectUserByUsername = (username: string) =>
    createSelector([selectUsers], (users) =>
        users.find((user) => user.username === username)
    );

export const selectActiveUsers = createSelector([selectUsers], (users) =>
    users.filter((user) => user.isActive)
);

export const selectInactiveUsers = createSelector([selectUsers], (users) =>
    users.filter((user) => !user.isActive)
);

export const selectUsersByRole = (role: 'approver' | 'assistant' | 'admin') =>
    createSelector([selectUsers], (users) =>
        users.filter((user) => user.role === role)
    );

export const selectApprovers = createSelector([selectUsers], (users) =>
    users.filter((user) => user.role === 'approver')
);

export const selectAdmins = createSelector([selectUsers], (users) =>
    users.filter((user) => user.role === 'admin')
);

export const selectAssistants = createSelector([selectUsers], (users) =>
    users.filter((user) => user.role === 'assistant')
);

export const selectSortedUsers = createSelector([selectUsers], (users) =>
    [...users].sort((a, b) => a.username.localeCompare(b.username))
);

export const selectUserLoadingState = createSelector(
    [selectUserStatus],
    (status) => status === 'loading'
);