import issueRepository from './issueRepository';

const statsRepository = {
  getStats: () => issueRepository.getStats(),
  getHeatmap: () => issueRepository.getHeatmap(),
};

export default statsRepository;