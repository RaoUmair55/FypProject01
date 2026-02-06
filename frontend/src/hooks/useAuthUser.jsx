import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const useAuthUser = () => {
    return useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            try {
                const res = await api.get("/auth/getMe");
                return res.data;
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    return null; // Not authenticated
                }
                throw error;
            }
        },
        retry: false,
    });
};

export default useAuthUser;
