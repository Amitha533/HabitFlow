import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
});

// HABITS
export const getHabits = () => API.get('/habits');
export const createHabit = (habit) => API.post('/habits', habit);
export const updateHabit = (id, habit) => API.put(`/habits/${id}`, habit);
export const deleteHabit = (id) => API.delete(`/habits/${id}`);

// PROGRESS
export const getTodayProgress = () => API.get('/progress/today');
export const markComplete = (habitId, notes = '') =>
  API.post(`/progress/complete/${habitId}`, null, { params: { notes } });
export const unmarkComplete = (habitId) => API.delete(`/progress/uncomplete/${habitId}`);
export const getStreak = (habitId) => API.get(`/progress/streak/${habitId}`);
export const getHabitProgress = (habitId) => API.get(`/progress/habit/${habitId}`);

// BADGES
export const getAllBadges = () => API.get('/badges');
export const getHabitBadges = (habitId) => API.get(`/badges/habit/${habitId}`);