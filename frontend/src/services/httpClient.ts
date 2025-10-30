import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const withCredentialsEnv = import.meta.env.VITE_API_WITH_CREDENTIALS;
const withCredentials = withCredentialsEnv
  ? withCredentialsEnv.toLowerCase() === 'true'
  : true;

const httpClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials,
});

export default httpClient;
