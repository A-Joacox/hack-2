import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ExpenseCategory {
  id: number;
  name: string;
}

interface ExpenseSummary {
  id: number;
  category: ExpenseCategory;
  year: number;
  month: number;
  amount: number;
}

interface ExpenseDetail {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
}

const Menu: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseSummary[] | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    categoryId: '',
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    amount: '',
  });
  const [adding, setAdding] = useState(false);
  const [details, setDetails] = useState<ExpenseDetail[] | null>(null);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [detailsKey, setDetailsKey] = useState<string>('');
  const [showExpenses, setShowExpenses] = useState(false);

  useEffect(() => {
    // Obtener categorías al cargar el componente
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<ExpenseCategory[]>(
          'http://198.211.105.95:8080/expenses_category',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(response.data);
      } catch (err: any) {
        setError('Error cargando categorías');
      }
    };
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    setExpenses(null);
    setDetails(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<ExpenseSummary[]>(
        'http://198.211.105.95:8080/expenses_summary',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setExpenses(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error fetching expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseDetails = async (categoryId: number, year: number, month: number, categoryName: string) => {
    const key = `${categoryId}-${year}-${month}`;
    // Si ya se están mostrando los detalles de esta categoría y mes, ocultar
    if (detailsKey === key) {
      setDetails(null);
      setDetailsKey('');
      setDetailsTitle('');
      setShowExpenses(true); // Mostrar menú al ocultar detalles
      return;
    }
    setLoading(true);
    setError('');
    setDetails(null);
    setDetailsTitle('');
    setShowExpenses(false); // Ocultar menú al mostrar detalles
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<ExpenseDetail[]>(
        `http://198.211.105.95:8080/expenses/detail?year=${year}&month=${month}&categoryId=${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDetails(response.data);
      setDetailsTitle(`${categoryName} - ${month}/${year}`);
      setDetailsKey(key);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error fetching expense details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const selectedCategory = categories.find(cat => cat.id === Number(form.categoryId));
      if (!selectedCategory) {
        setError('Selecciona una categoría válida');
        setAdding(false);
        return;
      }
      const body = {
        category: { id: selectedCategory.id, name: selectedCategory.name },
        year: Number(form.year),
        month: Number(form.month),
        amount: Number(form.amount),
      };
      await axios.post('http://198.211.105.95:8080/expenses', body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setForm({
        categoryId: '',
        year: new Date().getFullYear().toString(),
        month: (new Date().getMonth() + 1).toString(),
        amount: ''
      });
      fetchExpenses();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error adding expense');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://198.211.105.95:8080/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchExpenses();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error deleting expense');
      alert(err.response?.data?.message || err.message || 'Error deleting expense');
    }
  };

  const handleToggleExpenses = () => {
    if (showExpenses) {
      setShowExpenses(false);
      setExpenses(null);
      setDetails(null);
      setDetailsKey('');
      setDetailsTitle('');
    } else {
      fetchExpenses();
      setShowExpenses(true);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <h2>Menú Principal</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button onClick={handleToggleExpenses} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {showExpenses ? 'Ocultar gastos' : 'Ver gastos'}
        </button>
        <button onClick={() => setShowCategories((v) => !v)} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {showCategories ? 'Ocultar categorías' : 'Ver categorías'}
        </button>
      </div>
      {/* Lista de categorías */}
      {showCategories && (
        <div style={{ marginBottom: 24 }}>
          <h3>Categorías disponibles</h3>
          <ul>
            {categories.map((cat) => (
              <li key={cat.id}>{cat.name} (ID: {cat.id})</li>
            ))}
          </ul>
        </div>
      )}
      {/* Formulario para añadir gasto */}
      <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleInputChange}
          required
          style={{ padding: 8, borderRadius: 4, width: 140 }}
        >
          <option value="">Categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="number"
          name="year"
          value={form.year}
          onChange={handleInputChange}
          min="2000"
          max="2100"
          required
          style={{ padding: 8, borderRadius: 4, width: 80 }}
          placeholder="Año"
        />
        <input
          type="number"
          name="month"
          value={form.month}
          onChange={handleInputChange}
          min="1"
          max="12"
          required
          style={{ padding: 8, borderRadius: 4, width: 60 }}
          placeholder="Mes"
        />
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleInputChange}
          min="0"
          step="0.01"
          required
          style={{ padding: 8, borderRadius: 4, width: 100 }}
          placeholder="Monto"
        />
        <button type="submit" disabled={adding} style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {adding ? 'Añadiendo...' : 'Añadir gasto'}
        </button>
      </form>
      {loading && <p>Cargando gastos...</p>}
      {error && <div style={{ color: '#dc3545', background: '#f8d7da', border: '1px solid #f5c2c7', padding: 8, borderRadius: 4 }}>{error}</div>}
      {showExpenses && expenses && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>ID</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Categoría</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Año</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Mes</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Monto</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{exp.id}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{(exp.category || exp.expenseCategory)?.name}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{exp.year}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{exp.month}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{exp.amount.toFixed(2)}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  <button onClick={() => handleDeleteExpense(exp.id)} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                    Borrar
                  </button>
                  <button onClick={() => fetchExpenseDetails((exp.category || exp.expenseCategory).id, exp.year, exp.month, (exp.category || exp.expenseCategory).name)} style={{ marginLeft: 8, padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Tabla de detalles de gastos individuales */}
      {details && (
        <div style={{ marginTop: 32 }}>
          <h3>Detalles de gastos: {detailsTitle}</h3>
          <button onClick={() => { setDetails(null); setDetailsKey(''); setDetailsTitle(''); setShowExpenses(true); }} style={{ marginBottom: 12, padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Ocultar detalles
          </button>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>ID</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Descripción</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Monto</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Fecha</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {details.map((d) => (
                <tr key={d.id}>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{d.id}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{d.description || '-'}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{d.amount.toFixed(2)}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{d.date ? new Date(d.date).toLocaleDateString() : '-'}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{d.category?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Menu; 