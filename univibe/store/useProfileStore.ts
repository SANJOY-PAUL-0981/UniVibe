import { create } from "zustand";

export type ProfileData = {
	id: string;
	username: string;
	profilePicture: string | null;
	gender: string | null;
	age: number | null;
	pronouns: string | null;
	college: string | null;
	fieldOfStudy: string | null;
	semester: number | null;
	hobbies: string[];
};

export type MainUserData = {
	id: string;
	name: string;
	email: string;
	profile: ProfileData;
};

type ProfileStore = {
	user: MainUserData | null;
	isLoading: boolean;
	error: string | null;
	hydrated: boolean;

	setProfileFromServer: (user: MainUserData) => void;
	setLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
	updateProfilePartial: (profilePatch: Partial<ProfileData>) => void;
	clearProfile: () => void;
};

const initialState = {
	user: null,
	isLoading: false,
	error: null,
	hydrated: false,
} as const;

export const useProfileStore = create<ProfileStore>((set) => ({
	...initialState,

	setProfileFromServer: (user) =>
		set({
			user,
			hydrated: true,
			error: null,
			isLoading: false,
		}),

	setLoading: (isLoading) => set({ isLoading }),

	setError: (error) => set({ error }),

	updateProfilePartial: (profilePatch) =>
		set((state) => {
			if (!state.user) {
				return state;
			}

			return {
				user: {
					...state.user,
					profile: {
						...state.user.profile,
						...profilePatch,
					},
				},
			};
		}),

	clearProfile: () =>
		set({
			...initialState,
			hydrated: true,
		}),
}));

// Keep subscriptions focused so components rerender only for relevant fields.
export const selectProfileStoreUser = (state: ProfileStore) => state.user;
export const selectProfileStoreProfile = (state: ProfileStore) => state.user?.profile ?? null;
export const selectProfileStoreProfilePicture = (state: ProfileStore) =>
	state.user?.profile.profilePicture ?? null;
export const selectProfileStoreHobbies = (state: ProfileStore) =>
	state.user?.profile.hobbies ?? [];
export const selectProfileStoreHydrated = (state: ProfileStore) => state.hydrated;
export const selectProfileStoreLoading = (state: ProfileStore) => state.isLoading;
export const selectProfileStoreError = (state: ProfileStore) => state.error;