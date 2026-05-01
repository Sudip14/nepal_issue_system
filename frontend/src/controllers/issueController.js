import issueRepository from '../repositories/issueRepository';

const issueController = {
  fetchIssues: async (filters) => {
    const res = await issueRepository.getAll(filters);
    return res.data.results || res.data;
  },

  createIssue: async (formData) => {
    await issueRepository.create(formData);
  },

  vote: async (id) => {
    await issueRepository.vote(id);
  },

  updateStatus: async (id, status) => {
    await issueRepository.updateStatus(id, status, `Status updated to ${status}`);
  },
};

export default issueController;