import { apiSlice } from "../apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
	endpoints: builder => ({
		getUsers: builder.mutation({
			query: () => '/user',
		}),
		getUser: builder.mutation({
			query: (id) => `/user/${id}`,
		}),
		deleteUser: builder.mutation({
			query: (id) => ({
				url: `/user/${id}`,
				method: 'DELETE'
			})
		}),
		updateUser: builder.mutation({
			query: ({id, newUserData}) => ({
				url: `/user/${id}`,
				method: 'PUT',
				newUserData
			})
		}),
	})
})

export const {
	useGetUserMutation,
	useGetUsersMutation,
	useDeleteUserMutation,
	useUpdateUserMutation,
} = authApiSlice

