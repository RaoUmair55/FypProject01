// src/api/authenticatedFetch.js
const BACKEND_URL = "https://fypproject01.onrender.com";

export async function authenticatedFetch(endpoint, options = {}) {
    const token = localStorage.getItem("jwt_token");

    if (!token) {
        // Handle case where user is not authenticated (e.g., redirect to login)
        throw new Error("User not authenticated.");
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers, // Allow overriding/adding other headers
    };

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        // Token expired or invalid, clear it and force re-authentication
        localStorage.removeItem("jwt_token");
        // Optionally, trigger a redirect to login page if you have a centralized auth context
        window.location.href = '/login'; 
        throw new Error("Unauthorized: Please log in again.");
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${res.status}`);
    }

    return res.json();
}