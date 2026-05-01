import authRepository from '../repositories/authRepository';

const authController = {
  login: async (credentials, navigate) => {
    const res = await authRepository.login(credentials);
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);

    const meRes = await authRepository.getToken(res.data.access);
    const userType = meRes.data.user_type;

    if (userType === 'admin') navigate('/admin-panel');
    else if (userType === 'authority') navigate('/authority');
    else navigate('/dashboard');
  },

  register: async (formData) => {
    await authRepository.register(formData);
  },

  logout: (navigate) => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  },

  getMe: async () => {
    const res = await authRepository.getMe();
    return res.data;
  },
};

export default authController;