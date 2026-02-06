import axios from "axios";

// Create Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true, // Send cookies with requests
    headers: {
        "Content-Type": "application/json",
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error || error.message || "Something went wrong";

        if (error.response?.status === 401) {
            // Basic handling: if 401, maybe unauthorized. 
            // The frontend App.jsx handles auth state, but we could broadcast an event here.
            console.warn("Unauthorized access detected in API");
        }

        return Promise.reject(error);
    }
);

export default api;
