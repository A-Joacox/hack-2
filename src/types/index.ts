export interface User {
  email: string;
  token: string;
}

export interface AuthResponse {
  status: number;
  message: string;
  data: {
    token: string;
    email: string;
  };
}

export interface ExpenseCategory {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string;
  categoryId: number;
}

export interface ExpenseSummary {
  categoryId: number;
  categoryName: string;
  total: number;
}

export interface Goal {
  id: number;
  amount: number;
  month: number;
  year: number;
  achieved: boolean;
}

export interface ApiError {
  status: number;
  message: string;
} 