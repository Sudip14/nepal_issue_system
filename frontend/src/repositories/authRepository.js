import API from '../api/axios';

const authRepository = {
  login: (credentials) =>
    API.post('/api/token/', credentials),

  register: (data) =>
    API.post('/api/auth/register/', data),

  getMe: () =>
    API.get('/api/auth/me/'),

  getToken: (accessToken) =>
    API.get('/api/auth/me/', {
      headers: { Authorization: `Bearer ${accessToken}` }
    }),
};

export default authRepository;