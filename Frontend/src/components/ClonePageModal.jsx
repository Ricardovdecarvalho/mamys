// ClonePageModal.jsx
import React, { useState } from 'react';
import axios from 'axios';

const ClonePageModal = ({ isOpen, onClose, onCloneSuccess }) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!url) {
            setError('Por favor, insira uma URL');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Faz POST para o endpoint de clonagem
            const response = await axios.post('http://localhost:3002/api/pages/clone', {
                targetUrl: url
            });

            if (response.data.success) {
                // O backend retorna algo como:
                // { success: true, page: { id, url, cloneUrl } }
                setSuccess('Página clonada com sucesso!');

                // Chamamos o callback passando a "page" completa
                // Caso você queira só o cloneUrl, use response.data.page.cloneUrl
                onCloneSuccess?.(response.data.page);

                // Fecha o modal após 2 segundos
                setTimeout(() => {
                    setSuccess('');
                    onClose();
                    setUrl('');
                }, 2000);
            } else {
                setError(response.data.error || 'Erro ao clonar página');
            }
        } catch (err) {
            console.error('Erro completo:', err);
            console.error('Dados do erro:', err.response?.data);
            setError(err.response?.data?.error || 'Erro ao clonar a página. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 relative">
                {/* Botão de fechar (X) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Clonar Página
                </h2>

                {/* Exibe mensagem de erro, se houver */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Exibe mensagem de sucesso, se houver */}
                {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            URL da página que deseja clonar
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://exemplo.com"
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            disabled={loading}
                        />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Cole a URL completa da página que você deseja clonar
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-md text-white font-medium ${loading
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            } transition-colors`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 
                      0 0 5.373 0 12h4zm2 5.291A7.962 
                      7.962 0 014 12H0c0 3.042 1.135 
                      5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Clonando página...
                            </span>
                        ) : (
                            'Clonar Página'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ClonePageModal;
