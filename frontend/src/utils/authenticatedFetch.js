const BACKEND_URL = "https://fypproject01.onrender.com";

export async function authenticatedFetch(endpoint, options = {}) {
    const token = localStorage.getItem("jwt_token");

    if (!token) {
        throw new Error("User not authenticated.");
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    // Only add JSON Content-Type if not sending FormData
    const isFormData = options.body instanceof FormData;
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        localStorage.removeItem("jwt_token");
        window.location.href = '/login'; 
        throw new Error("Unauthorized: Please log in again.");
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${res.status}`);
    }

    return res.json();
}