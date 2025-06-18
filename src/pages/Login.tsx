import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/menu');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 to-base-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-base-300">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-primary">Ahorrista</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block mb-1 font-semibold text-blue-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input input-bordered w-full"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 font-semibold text-blue-700">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input input-bordered w-full"
            />
          </div>
          {error && <div className="alert alert-error py-2"><span>{error}</span></div>}
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="text-center mt-6 text-blue-700">
          ¿No tienes cuenta?{' '}
          <RouterLink to="/register" className="link link-primary">Regístrate aquí</RouterLink>
        </p>
      </div>
    </div>
  );
};

export default Login; 