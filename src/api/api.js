const BASE_URL = 'https://api.getyovo.app/api/v1';

const api = {
    post: async (endpoint, data, token) => {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            let errorMessage = result.error?.message || result.message || 'Something went wrong';
            
            // If there are specific validation details, use the first one as the message
            if (result.error?.details && Array.isArray(result.error.details) && result.error.details.length > 0) {
                errorMessage = result.error.details[0].message;
            }

            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }

        return result;
    },

    get: async (endpoint, token) => {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });

        const result = await response.json();

        if (!response.ok) {
            let errorMessage = result.error?.message || result.message || 'Something went wrong';

            if (result.error?.details && Array.isArray(result.error.details) && result.error.details.length > 0) {
                errorMessage = result.error.details[0].message;
            }
            
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }

        return result;
    },

    patch: async (endpoint, data, token) => {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            let errorMessage = result.error?.message || result.message || 'Something went wrong';
            
            if (result.error?.details && Array.isArray(result.error.details) && result.error.details.length > 0) {
                errorMessage = result.error.details[0].message;
            }

            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }

        return result;
    },

    delete: async (endpoint, data, token) => {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        const result = await response.json();

        if (!response.ok) {
            let errorMessage = result.error?.message || result.message || 'Something went wrong';
            
            if (result.error?.details && Array.isArray(result.error.details) && result.error.details.length > 0) {
                errorMessage = result.error.details[0].message;
            }

            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }

        return result;
    },
};

export default api;
