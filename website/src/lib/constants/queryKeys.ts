export const queryKeys = {
	auth: {
		currentUser: ['auth', 'currentUser'] as const,
	},
	cart: {
		all: ['cart', 'all'] as const,
	},
}

export type QueryKey = readonly string[]
