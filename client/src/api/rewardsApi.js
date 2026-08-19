import axiosClient from './axiosClient';

export const rewardsApi = {
  // Get all rewards
  getRewards: (activeOnly = true, skip = 0, limit = 100) => 
    axiosClient.get(`/rewards?active_only=${activeOnly}&skip=${skip}&limit=${limit}`),

  // Get reward by ID
  getReward: (rewardId) => 
    axiosClient.get(`/rewards/${rewardId}`),

  // Create new reward
  createReward: (rewardData) => 
    axiosClient.post('/rewards', rewardData),

  // Update reward
  updateReward: (rewardId, rewardData) => 
    axiosClient.put(`/rewards/${rewardId}`, rewardData),

  // Delete reward (deactivate)
  deleteReward: (rewardId) => 
    axiosClient.delete(`/rewards/${rewardId}`),

  // Get available rewards for customer
  getAvailableRewards: (customerId) => 
    axiosClient.get(`/rewards/customer/${customerId}/available`),
};

export default rewardsApi;
