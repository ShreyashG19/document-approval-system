import { type RootState } from '@/store/store';
import { createSelector } from '@reduxjs/toolkit';

export const selectAuthState = (state: RootState) => state.auth;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;

//memoized/computed selectors

export const selectIsAuthenticated = createSelector([selectCurrentUser], (user) => !!user);

export const selectUserDetails = createSelector([selectCurrentUser], (user) => ({
    name: user?.fullName,
    email: user?.email,
    role: user?.role,
    id: user?.id,
}));

export const selectAuthLoadingState = createSelector(
    [selectAuthStatus],
    (status) => status === 'loading'
);

// selectors for permissions/roles

export const selectUserPermissions = createSelector(
    [selectCurrentUser],
    (user) => user?.role || []
);
