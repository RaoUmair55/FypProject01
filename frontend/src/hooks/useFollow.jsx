import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../utils/api";

const useFollow = () => {
    const queryClient = useQueryClient();

    const { mutate: follow, isPending, isError, error } = useMutation({
        mutationFn: async (userId) => {
            try {
                const res = await api.post(`/user/follow/${userId}`);
                return res.data;
            } catch (error) {
                console.error("Error in useFollow mutation:", error);
                throw error;
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
