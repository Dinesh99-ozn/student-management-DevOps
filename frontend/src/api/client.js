// Axios clients for the Student Management microservices.
// Each client points to one backend service and automatically
// attaches the logged-in user's JWT token.

import axios from 'axios';

// Local Docker development API URLs.
const AUTH_URL = 'http://localhost:4001/api';
const STUDENT_URL = 'http://localhost:4002/api';
const ACADEMIC_URL = 'http://localhost:4003/api';

function createClient(baseURL) {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Attach JWT token to protected API requests.
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return instance;
}

export const authApi = createClient(AUTH_URL);
export const studentApi = createClient(STUDENT_URL);
export const academicApi = createClient(ACADEMIC_URL);