import API from '../api/axios';

const issueRepository = {
getAll: (filters = {}) => {
  let url = '/api/issues/?';
  if (filters.category && filters.category !== 'all') url += `category=${filters.category}&`;
  if (filters.status && filters.status !== 'all') url += `status=${filters.status}&`;
  if (filters.search && filters.search.trim() !== '') url += `search=${encodeURIComponent(filters.search)}&`;
  if (filters.ward && filters.ward !== 'all') url += `ward=${filters.ward}&`;
  return API.get(url);
},

  create: (data) =>
    API.post('/api/issues/', data),

  vote: (id) =>
    API.post(`/api/issues/${id}/vote/`),

  updateStatus: (id, status, message) =>
    API.patch(`/api/issues/${id}/update_status/`, { status, message }),

  getStats: () =>
    API.get('/api/issues/stats/'),

  getHeatmap: () =>
    API.get('/api/issues/heatmap/'),
};

export default issueRepository;