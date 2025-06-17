import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { expenseService, categoryService } from '../services/api';
import type { Expense, ExpenseCategory, ExpenseSummary } from '../types';
import AddExpenseForm from '../components/AddExpenseForm';

const Dashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseSummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categoryDetails, setCategoryDetails] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showAddExpense, setShowAddExpense] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    loadCategories();
    loadExpenses();
  }, [currentMonth, currentYear]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      alert('Failed to load categories');
    }
  };

  const loadExpenses = async () => {
    try {
      const data = await expenseService.getSummary(currentYear, currentMonth);
      setExpenses(data);
    } catch (error) {
      alert('Failed to load expenses');
    }
  };

  const handleCategoryClick = async (categoryId: number) => {
    try {
      const details = await expenseService.getDetails(
        currentYear,
        currentMonth,
        categoryId
      );
      setCategoryDetails(details);
      setSelectedCategory(categoryId);
    } catch (error) {
      alert('Failed to load category details');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await expenseService.delete(id);
      setCategoryDetails((prev) => prev.filter((expense) => expense.id !== id));
      loadExpenses();
      alert('Expense deleted successfully');
    } catch (error) {
      alert('Failed to delete expense');
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      await expenseService.create(expense);
      loadExpenses();
      if (selectedCategory === expense.categoryId) {
        const details = await expenseService.getDetails(
          currentYear,
          currentMonth,
          expense.categoryId
        );
        setCategoryDetails(details);
      }
      setShowAddExpense(false);
      alert('Expense added successfully');
    } catch (error) {
      alert('Failed to add expense');
    }
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Ahorrista Dashboard</h1>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="filters">
        <select
          value={currentMonth}
          onChange={(e) => setCurrentMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month}>
              {new Date(2000, month - 1).toLocaleString('default', {
                month: 'long',
              })}
            </option>
          ))}
        </select>
        <select
          value={currentYear}
          onChange={(e) => setCurrentYear(Number(e.target.value))}
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
            (year) => (
              <option key={year} value={year}>
                {year}
              </option>
            )
          )}
        </select>
        <button onClick={() => setShowAddExpense(true)} className="add-button">
          Add Expense
        </button>
      </div>

      <div className="expense-grid">
        {expenses.map((expense) => (
          <div
            key={expense.categoryId}
            className="expense-card"
            onClick={() => handleCategoryClick(expense.categoryId)}
          >
            <h3>{expense.categoryName}</h3>
            <p className="amount">S/ {expense.total.toFixed(2)}</p>
            <p className="date">
              {new Date(currentYear, currentMonth - 1).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        ))}
      </div>

      {selectedCategory && (
        <div className="category-details">
          <h2>
            {categories.find((c) => c.id === selectedCategory)?.name} Details
          </h2>
          <div className="expense-list">
            {categoryDetails.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-info">
                  <h4>{expense.description}</h4>
                  <p>{new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <div className="expense-actions">
                  <span className="amount">S/ {expense.amount.toFixed(2)}</span>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddExpense && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Expense</h2>
            <button
              className="close-button"
              onClick={() => setShowAddExpense(false)}
            >
              ×
            </button>
            <AddExpenseForm
              categories={categories}
              onSubmit={handleAddExpense}
              onCancel={() => setShowAddExpense(false)}
              year={currentYear}
              month={currentMonth}
            />
          </div>
        </div>
      )}

      <style>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .filters {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        select {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .expense-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .expense-card {
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          cursor: pointer;
          transition: box-shadow 0.3s;
        }
        .expense-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .amount {
          font-size: 1.5rem;
          font-weight: bold;
          color: #007bff;
        }
        .date {
          color: #666;
          font-size: 0.9rem;
        }
        .category-details {
          margin-top: 30px;
        }
        .expense-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .expense-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .expense-info h4 {
          margin: 0;
          margin-bottom: 5px;
        }
        .expense-info p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
        .expense-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .delete-button {
          padding: 5px 10px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .add-button {
          padding: 8px 16px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .logout-button {
          padding: 8px 16px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          position: relative;
          width: 100%;
          max-width: 500px;
        }
        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 