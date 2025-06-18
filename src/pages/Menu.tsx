import * as React from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ExpenseCategory {
  id: number;
  name: string;
}

interface ExpenseSummary {
  id: number;
  category?: ExpenseCategory;
  expenseCategory?: ExpenseCategory;
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
  const [expenses, setExpenses] = React.useState<ExpenseSummary[] | null>(null);
  const [categories, setCategories] = React.useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({
    categoryId: '',
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    amount: '',
  });
  const [adding, setAdding] = React.useState(false);
  const [details, setDetails] = React.useState<ExpenseDetail[] | null>(null);
  const [detailsTitle, setDetailsTitle] = React.useState('');
  const [showCategories, setShowCategories] = React.useState(false);
  const [detailsKey, setDetailsKey] = React.useState<string>('');
  const [showExpenses, setShowExpenses] = React.useState(false);
  const [filter, setFilter] = React.useState({
    categoryId: '',
    year: '',
    month: '',
    amount: '',
    amountOp: 'eq',
  });
  const [filteredExpenses, setFilteredExpenses] = React.useState<ExpenseSummary[] | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
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
    if (
      typeof categoryId !== 'number' ||
      typeof year !== 'number' ||
      typeof month !== 'number' ||
      isNaN(categoryId) ||
      isNaN(year) ||
      isNaN(month)
    ) {
      setError('Parámetros inválidos para ver detalles');
      return;
    }
    const key = `${categoryId}-${year}-${month}`;
    if (detailsKey === key) {
      setDetails(null);
      setDetailsKey('');
      setDetailsTitle('');
      setShowExpenses(true);
      return;
    }
    setLoading(true);
    setError('');
    setDetails(null);
    setDetailsTitle('');
    setShowExpenses(false);
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    if (!expenses) return;
    let result = [...expenses];
    if (filter.categoryId) {
      result = result.filter(e => (e.category || e.expenseCategory)?.id === Number(filter.categoryId));
    }
    if (filter.year) {
      result = result.filter(e => e.year === Number(filter.year));
    }
    if (filter.month) {
      result = result.filter(e => e.month === Number(filter.month));
    }
    if (filter.amount) {
      const amount = Number(filter.amount);
      if (filter.amountOp === 'eq') {
        result = result.filter(e => e.amount === amount);
      } else if (filter.amountOp === 'gte') {
        result = result.filter(e => e.amount >= amount);
      } else if (filter.amountOp === 'lte') {
        result = result.filter(e => e.amount <= amount);
      }
    }
    setFilteredExpenses(result);
  };

  const clearFilters = () => {
    setFilter({ categoryId: '', year: '', month: '', amount: '', amountOp: 'eq' });
    setFilteredExpenses(null);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-base-200 to-base-100">
      <div className="w-full max-w-4xl mx-auto mt-8 p-8 bg-white rounded-2xl shadow-2xl relative border border-base-300 text-black">
        <button onClick={handleLogout} className="btn btn-error absolute top-6 right-6">Cerrar sesión</button>
        <h2 className="text-4xl font-extrabold mb-8 text-center text-primary text-black">Menú Principal</h2>
        <div className="flex gap-4 mb-8 justify-center">
          <button className={`btn ${showExpenses ? 'btn-primary' : 'btn-outline btn-primary'} text-black`} onClick={handleToggleExpenses}>
            {showExpenses ? 'Ocultar gastos' : 'Ver gastos'}
          </button>
          <button className={`btn ${showCategories ? 'btn-outline btn-secondary' : 'btn-secondary'} text-black`} onClick={() => setShowCategories((v) => !v)}>
            {showCategories ? 'Ocultar categorías' : 'Ver categorías'}
          </button>
          <button className={`btn ${showFilters ? 'btn-outline btn-accent' : 'btn-accent'} text-black`} onClick={() => setShowFilters((v) => !v)}>
            {showFilters ? 'Ocultar filtros' : 'Filtrar gastos'}
          </button>
        </div>
        {showFilters && (
          <div className="mb-8 p-6 bg-base-200 rounded-xl border border-base-300 text-black">
            <h3 className="text-xl font-semibold mb-4 text-accent">Filtrar Gastos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Categoría</span>
                </label>
                <select
                  name="categoryId"
                  value={filter.categoryId}
                  onChange={handleFilterChange}
                  className="select select-bordered w-full text-gray-300 placeholder-gray-300"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Año</span>
                </label>
                <input
                  type="number"
                  name="year"
                  value={filter.year}
                  onChange={handleFilterChange}
                  placeholder="Año"
                  className="input input-bordered w-full text-gray-300 placeholder-gray-300"
                  min="2000"
                  max="2100"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Mes</span>
                </label>
                <select
                  name="month"
                  value={filter.month}
                  onChange={handleFilterChange}
                  className="select select-bordered w-full text-gray-300 placeholder-gray-300"
                >
                  <option value="">Todos los meses</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Monto</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="amountOp"
                    value={filter.amountOp}
                    onChange={handleFilterChange}
                    className="select select-bordered w-24 text-gray-300 placeholder-gray-300"
                  >
                    <option value="eq">=</option>
                    <option value="gte">≥</option>
                    <option value="lte">≤</option>
                  </select>
                  <input
                    type="number"
                    name="amount"
                    value={filter.amount}
                    onChange={handleFilterChange}
                    placeholder="Monto"
                    className="input input-bordered flex-1 text-gray-300 placeholder-gray-300"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={clearFilters} className="btn btn-outline btn-error">
                Limpiar filtros
              </button>
              <button onClick={applyFilters} className="btn btn-primary">
                Aplicar filtros
              </button>
            </div>
          </div>
        )}
        {showCategories && (
          <div className="mb-8 p-6 bg-base-200 rounded-xl border border-base-300 text-black">
            <h3 className="text-xl font-semibold mb-3 text-secondary text-black">Categorías disponibles</h3>
            <div className="flex flex-wrap gap-3">
              {categories.length === 0 ? (
                <span className="text-base-content/60">No hay categorías disponibles.</span>
              ) : (
                categories.map((cat) => (
                  <span key={cat.id} className="badge badge-info badge-lg text-lg px-4 py-2 text-black">{cat.name} (ID: {cat.id})</span>
                ))
              )}
            </div>
          </div>
        )}
        {/* Formulario para añadir gasto */}
        <form onSubmit={handleAddExpense} className="flex flex-wrap gap-3 mb-8 items-center justify-center bg-base-200 p-6 rounded-xl border border-base-300">
          <h3 className="w-full text-xl font-semibold mb-4 text-primary">Añadir Nuevo Gasto</h3>
          <label htmlFor="categoryId" className="sr-only">Categoría</label>
          <select
            id="categoryId"
            name="categoryId"
            value={form.categoryId}
            onChange={handleInputChange}
            required
            className="select select-bordered w-40 text-white placeholder-white"
          >
            <option value="">Categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <label htmlFor="year" className="sr-only">Año</label>
          <input
            id="year"
            type="number"
            name="year"
            value={form.year}
            onChange={handleInputChange}
            min="2000"
            max="2100"
            required
            className="input input-bordered w-28 text-white placeholder-white"
            placeholder="Año"
          />
          <label htmlFor="month" className="sr-only">Mes</label>
          <input
            id="month"
            type="number"
            name="month"
            value={form.month}
            onChange={handleInputChange}
            min="1"
            max="12"
            required
            className="input input-bordered w-24 text-white placeholder-white"
            placeholder="Mes"
          />
          <label htmlFor="amount" className="sr-only">Monto</label>
          <input
            id="amount"
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            required
            className="input input-bordered w-32 text-white placeholder-white"
            placeholder="Monto"
          />
          <button type="submit" disabled={adding} className="btn btn-success btn-lg">
            {adding ? 'Añadiendo...' : 'Añadir gasto'}
          </button>
        </form>
        {showExpenses && (
          <>
            {loading ? (
              <div className="flex justify-center items-center my-8">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : (filteredExpenses ?? expenses)?.length === 0 ? (
              <div className="text-center text-base-content/60 my-8">No hay gastos registrados.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-base-300 shadow-md">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th className="text-black">ID</th>
                      <th className="text-black">Categoría</th>
                      <th className="text-black">Año</th>
                      <th className="text-black">Mes</th>
                      <th className="text-black">Monto</th>
                      <th className="text-black">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredExpenses ?? expenses).map((exp, idx) => {
                      const cat = exp.category || exp.expenseCategory;
                      return (
                        <tr key={exp.id} className={idx % 2 === 1 ? 'bg-white' : ''}>
                          <td>{exp.id}</td>
                          <td>{cat?.name}</td>
                          <td>{exp.year}</td>
                          <td>{exp.month}</td>
                          <td><span className="font-bold text-success">S/ {exp.amount.toFixed(2)}</span></td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn btn-xs btn-error" onClick={() => handleDeleteExpense(exp.id)}>Borrar</button>
                              {cat && typeof cat.id === 'number' && typeof exp.year === 'number' && typeof exp.month === 'number' && !isNaN(exp.year) && !isNaN(exp.month) && (
                                <button
                                  className="btn btn-xs btn-info"
                                  onClick={() => fetchExpenseDetails(cat.id, exp.year, exp.month, cat.name)}
                                >
                                  Ver detalles
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        {details && (
          <div className="mt-10">
            <div className="flex items-center mb-3">
              <h3 className="text-2xl font-semibold flex-1 text-info">Detalles de gastos: {detailsTitle}</h3>
              <button className="btn btn-sm btn-outline" onClick={() => { setDetails(null); setDetailsKey(''); setDetailsTitle(''); setShowExpenses(true); }}>Ocultar detalles</button>
            </div>
            <div className="divider mb-3"></div>
            <div className="overflow-x-auto rounded-xl border border-base-300 shadow">
              <table className="table table-compact w-full">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Categoría</th>
                  </tr>
                </thead>
                <tbody>
                  {details.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-base-content/60">No hay detalles para mostrar.</td></tr>
                  ) : details.map((d) => (
                    <tr key={d.id}>
                      <td>{d.id}</td>
                      <td>{d.description || '-'}</td>
                      <td><span className="font-bold text-success">S/ {d.amount.toFixed(2)}</span></td>
                      <td>{d.date ? new Date(d.date).toLocaleDateString() : '-'}</td>
                      <td>{d.category?.name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {error && <div className="alert alert-error mt-6"><span>{error}</span></div>}
      </div>
    </div>
  );
};

export default Menu; 