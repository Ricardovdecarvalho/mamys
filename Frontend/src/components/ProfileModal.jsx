import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfileModal = ({ isOpen, onClose }) => {
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const storedUser = JSON.parse(localStorage.getItem('userData'));
            if (storedUser) {
                setUserData(prev => ({
                    ...prev,
                    firstName: storedUser.firstName || '',
                    lastName: storedUser.lastName || '',
                    birthDate: formatDateForInput(storedUser.birthDate) || '',
                    email: storedUser.email || '',
                    phone: storedUser.phone || ''
                }));
            }
        }
    }, [isOpen]);

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const handleUserDataChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveData = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const token = localStorage.getItem('token');
            console.log('Token recuperado para atualização do perfil:', token); // Log para debug

            if (!token) {
                setErrorMsg('Token não encontrado. Por favor, faça login novamente.');
                setLoading(false);
                return;
            }

            const response = await axios.put(
                'http://localhost:3002/api/users/profile',
                {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    birthDate: userData.birthDate,
                    phone: userData.phone
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                const updatedUser = response.data.user;
                localStorage.setItem('userData', JSON.stringify(updatedUser));

                setSuccessMsg('Dados salvos com sucesso!');
                setTimeout(() => {
                    setSuccessMsg('');
                }, 3000);
            }
        } catch (error) {
            console.error('Erro completo:', error);
            setErrorMsg(error.response?.data?.error || 'Erro ao salvar alterações');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        if (userData.newPassword !== userData.confirmPassword) {
            setErrorMsg('As senhas não coincidem');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            console.log('Token recuperado para alteração de senha:', token); // Log para debug

            if (!token) {
                setErrorMsg('Token não encontrado. Por favor, faça login novamente.');
                setLoading(false);
                return;
            }

            const response = await axios.put(
                'http://localhost:3002/api/auth/change-password',
                {
                    currentPassword: userData.currentPassword,
                    newPassword: userData.newPassword
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setSuccessMsg('Senha alterada com sucesso!');
                setUserData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));

                setTimeout(() => {
                    setSuccessMsg('');
                }, 3000);
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.error || 'Erro ao alterar senha');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="relative bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
                <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Meus dados
                    </h1>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {successMsg && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                            {successMsg}
                        </div>
                    )}

                    {errorMsg && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            {errorMsg}
                        </div>
                    )}

                    {/* Formulário de dados básicos */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Dados básicos
                        </h2>
                        <form onSubmit={handleSaveData} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Primeiro nome
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={userData.firstName}
                                        onChange={handleUserDataChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Sobrenome
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={userData.lastName}
                                        onChange={handleUserDataChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Data de nascimento
                                </label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={userData.birthDate}
                                    onChange={handleUserDataChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Telefone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={userData.phone}
                                    onChange={handleUserDataChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </form>
                    </div>

                    {/* Seção de email (somente leitura) */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            E-mail
                        </h2>
                        <input
                            type="email"
                            value={userData.email}
                            readOnly
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 bg-gray-100 dark:bg-gray-600"
                        />
                    </div>

                    {/* Seção de alteração de senha */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Alterar senha
                        </h2>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Senha atual
                                </label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={userData.currentPassword}
                                    onChange={handleUserDataChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nova senha
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={userData.newPassword}
                                    onChange={handleUserDataChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirmar nova senha
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={userData.confirmPassword}
                                    onChange={handleUserDataChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? 'Alterando...' : 'Alterar senha'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;