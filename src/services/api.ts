import axios from 'axios';
import type { AuthResponse, Expense, ExpenseCategory, ExpenseSummary, Goal } from '../types';

const API_URL = 'http://198.211.105.95:8080';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      if (window.location.pathname !== '/login') {
        alert('Sesión inválida, te estamos redirigiendo para volver a iniciar sesión');
        window.location.replace('/login');
        setTimeout(() => window.location.reload(), 100); // Forzar reload tras redirección
        return new Promise(() => {});
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/authentication/register', {
      email,
      passwd: password,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/authentication/login', {
      email,
      passwd: password,
    });
    return response.data;
  },
};

export const expenseService = {
  getSummary: async (year: number, month: number): Promise<ExpenseSummary[]> => {
    const response = await api.get<ExpenseSummary[]>(`/expenses_summary?year=${year}&month=${month}`);
    return response.data;
  },

  getDetails: async (year: number, month: number, categoryId: number): Promise<Expense[]> => {
    const response = await api.get<Expense[]>(
      `/expenses/detail?year=${year}&month=${month}&categoryId=${categoryId}`
    );
    return response.data;
  },

  create: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    const response = await api.post<Expense>('/expenses', expense);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};

export const categoryService = {
  getAll: async (): Promise<ExpenseCategory[]> => {
    const response = await api.get<ExpenseCategory[]>('/expenses_category');
    return response.data;
  },
};

export const goalService = {
  getAll: async (): Promise<Goal[]> => {
    const response = await api.get<Goal[]>('/goals');
    return response.data;
  },

  create: async (goal: Omit<Goal, 'id'>): Promise<Goal> => {
    const response = await api.post<Goal>('/goals', goal);
    return response.data;
  },

  update: async (id: number, goal: Partial<Goal>): Promise<Goal> => {
    const response = await api.patch<Goal>(`/goals/${id}`, goal);
    return response.data;
  },
}; 