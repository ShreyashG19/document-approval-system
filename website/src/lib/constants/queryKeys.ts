// lib/constants/queryKeys.ts
// Example query keys structure to support the API hooks

export const queryKeys = {
    auth: {
        all: ['auth'] as const,
        currentUser: ['auth', 'currentUser'] as const,
    },
    notifications: {
        all: ['notifications'] as const,
        unseen: ['notifications', 'unseen'] as const,
    },
    departments: {
        all: ['departments'] as const,
        detail: (id: string) => ['departments', id] as const,
    },
    users: {
        all: ['users'] as const,
        detail: (id: string) => ['users', id] as const,
        byRole: (role: string) => ['users', 'role', role] as const,
    },
    documents: {
        all: ['documents'] as const,
        detail: (id: string) => ['documents', id] as const,
    },
    cart: {
        all: ['cart'] as const,
    },
} as const;