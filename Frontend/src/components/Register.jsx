// components/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3002/api/auth/register', formData);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userData', JSON.stringify(response.data.user));
            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.error || 'Erro ao registrar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-white text-center mb-8">Registro</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500 text-white p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 mb-2">Primeiro Nome</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Sobrenome</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Data de Nascimento</label>
                        <input
                            type="date"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Telefone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(00) 00000-0000"
                            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Senha</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Confirmar Senha</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 ${loading
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            } text-white rounded-lg transition-colors`}
                    >
                        {loading ? 'Registrando...' : 'Registrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;