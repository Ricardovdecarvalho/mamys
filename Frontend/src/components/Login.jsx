import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Tentando fazer login...'); // Debug

    if (email && password) {
      try {
        if (email === 'admin@example.com' && password === 'admin') {
          console.log('Login admin bem-sucedido'); // Debug
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('isAuthenticated', 'true');
          navigate('/dashboard', { replace: true });
        } else if (email === 'client@example.com' && password === 'client') {
          console.log('Login cliente bem-sucedido'); // Debug
          localStorage.setItem('userRole', 'client');
          localStorage.setItem('isAuthenticated', 'true');
          navigate('/dashboard', { replace: true });
        } else {
          setError('Credenciais inválidas');
        }
      } catch (err) {
        console.error('Erro no login:', err); // Debug
        setError('Erro ao fazer login');
      }
    } else {
      setError('Por favor, preencha todos os campos');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Login</h1>
          <p className="text-gray-400 mt-2">Acesse sua conta para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500 text-white p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-300 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;