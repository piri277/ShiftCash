import api from './axios';

export const getSavingGoals = () =>
  api.get('/saving-goals/').then(r => r.data);

export const getSavingGoalDetail = (goalId) =>
  api.get(`/saving-goals/${goalId}`).then(r => r.data);

export const createSavingGoal = (data) =>
  api.post('/saving-goals/', data).then(r => r.data);

export const updateSavingGoal = (goalId, data) =>
  api.put(`/saving-goals/${goalId}`, data).then(r => r.data);

export const deleteSavingGoal = (goalId) =>
  api.delete(`/saving-goals/${goalId}`);

export const toggleDay = (goalId, dayNumber) =>
  api.post(`/saving-goals/${goalId}/toggle-day/${dayNumber}`).then(r => r.data);
