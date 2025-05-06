import {useMutation, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast"

const useFollow = () => {

    const queryClient = useQueryClient();

    const {mutate:follow, isPending, } = useMutation({
        mutationFn: async (userId) => {
            try {
                const res = await fetch(`/api/user/follow/${userId}`, {
                    method: 'POST',
    
                })
    
                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }
            } catch (error) {
                throw new Error(error.message);
            }   
        },
        onSuccess: () => {
            Promise.all([
                // remove the use from suggested panel after  followed
                queryClient.invalidateQueries({queryKey: ["suggestedUsers"]}),
                
                // change the `follow` to `unfollow`
                queryClient.invalidateQueries({queryKey: ["authUser"]}),
                
            ])
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return {follow, isPending};
}

export default useFollow;