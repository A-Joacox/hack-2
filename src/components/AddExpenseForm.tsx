import React, { useState } from 'react';
import type { Expense, ExpenseCategory } from '../types';

interface AddExpenseFormProps {
  categories: ExpenseCategory[];
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
  year: number;
  month: number;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({
  categories,
  onSubmit,
  onCancel,
  year,
  month,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expense: Omit<Expense, 'id'> = {
      description,
      amount: Number(amount),
      categoryId: Number(categoryId),
      date: date || new Date(year, month - 1).toISOString().split('T')[0],
    };
    onSubmit(expense);
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Enter expense description"
        />
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
          step="0.01"
          placeholder="Enter amount"
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={`${year}-${String(month).padStart(2, '0')}-01`}
          max={`${year}-${String(month).padStart(2, '0')}-31`}
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-button">
          Cancel
        </button>
        <button type="submit" className="submit-button">
          Add Expense
        </button>
      </div>

      <style>{`
        .expense-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        label {
          font-weight: bold;
        }
        input, select {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 10px;
        }
        .cancel-button {
          padding: 8px 16px;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .submit-button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .cancel-button:hover {
          background-color: #5a6268;
        }
        .submit-button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </form>
  );
};

export default AddExpenseForm; 