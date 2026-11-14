const PRODUCTION_API_BASE_URL = 'https://api.getyovo.app/api/v1';

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || PRODUCTION_API_BASE_URL;
