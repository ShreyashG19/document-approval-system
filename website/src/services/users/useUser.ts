import { useAppSelector } from '@/store/hooks';
import {
    selectUsers,
    selectUserStatus,
    selectUserError,
    selectUserCount,
    selectActiveUsers,
    selectInactiveUsers,
    selectApprovers,
    selectAdmins,
    selectAssistants,
    selectSortedUsers,
} from '@/services/users/userSelector';
import { useUserApi } from './userApi';

export const useUser = () => {
    // Get state from Redux
    const users = useAppSelector(selectUsers);
    const status = useAppSelector(selectUserStatus);
    const error = useAppSelector(selectUserError);
    const userCount = useAppSelector(selectUserCount);
    const activeUsers = useAppSelector(selectActiveUsers);
    const inactiveUsers = useAppSelector(selectInactiveUsers);
    const approvers = useAppSelector(selectApprovers);
    const admins = useAppSelector(selectAdmins);
    const assistants = useAppSelector(selectAssistants);
    const sortedUsers = useAppSelector(selectSortedUsers);

    // Get API operations
    const api = useUserApi();

    return {
        // State
        users,
        userCount,
        activeUsers,
        inactiveUsers,
        approvers,
        admins,
        assistants,
        sortedUsers,
        status,
        error,

        // API operations
        sendCredentials: api.sendCredentials,
        sendCredentialsAsync: api.sendCredentialsAsync,
        updateProfile: api.updateProfile,
        updateProfileAsync: api.updateProfileAsync,
        setUserStatus: api.setUserStatus,
        setUserStatusAsync: api.setUserStatusAsync,
        signoutAll: api.signoutAll,
        signoutAllAsync: api.signoutAllAsync,
        refetchUsers: api.refetchUsers,

        // Loading states
        isLoadingUsers: api.isLoadingUsers,
        isSendingCredentials: api.isSendingCredentials,
        isUpdatingProfile: api.isUpdatingProfile,
        isSettingUserStatus: api.isSettingUserStatus,
        isSigningOutAll: api.isSigningOutAll,

        // Errors
        sendCredentialsError: api.sendCredentialsError,
        updateProfileError: api.updateProfileError,
        setUserStatusError: api.setUserStatusError,
        signoutAllError: api.signoutAllError,
    };
};