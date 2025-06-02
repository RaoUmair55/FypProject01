import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authenticatedFetch } from "../utils/authenticatedFetch"; // Import the helper

const useFollow = () => {
    const queryClient = useQueryClient();

    const { mutate: follow, isPending, isError, error } = useMutation({ // Added isError and error for better handling
        mutationFn: async (userId) => {
            try {
                // Use authenticatedFetch for the follow/unfollow API call
                // It automatically handles the Authorization header and error parsing.
                const data = await authenticatedFetch(`/api/user/follow/${userId}`, {
                    method: 'POST',
                    // No need to set Content-Type: application/json or Authorization header here,
                    // as authenticatedFetch handles it.
                });
                return data;
            } catch (error) {
                console.error("Error in useFollow mutation:", error);
                throw error; // Re-throw for react-query to handle
            }
        },
        onSuccess: () => {
            // Invalidate queries to refetch relevant data after a successful follow/unfollow
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }), // To remove the user from suggested panel
                queryClient.invalidateQueries({ queryKey: ["authUser"] }),      // To update the authUser's following/followers list
                queryClient.invalidateQueries({ queryKey: ["userProfile"] }),   // To update the profile being viewed
            ]);
            toast.success("User followed/unfollowed successfully!"); // Generic success message
        },
        onError: (error) => {
            toast.error(error.message || "Failed to follow/unfollow user.");
        }
    });

    return { follow, isPending, isError, error }; // Export error states as well
}

export default useFollow;
