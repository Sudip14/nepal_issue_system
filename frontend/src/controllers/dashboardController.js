import issueRepository from '../repositories/issueRepository';
import statsRepository from '../repositories/statsRepository';

const dashboardController = {
  fetchStats: async () => {
    const res = await statsRepository.getStats();
    return res.data;
  },

  fetchHeatmap: async () => {
    const res = await statsRepository.getHeatmap();
    return res.data;
  },

  fetchIssues: async (filters) => {
    const res = await issueRepository.getAll(filters);
    return res.data.results || res.data;
  },
};

export default dashboardController;