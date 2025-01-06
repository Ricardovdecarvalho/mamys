// PageList.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Users, FileText, Link, Home, MessageSquare, HelpCircle, Globe, Database, Filter, ExternalLink, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/axios';
import ClonePageModal from '@/components/ClonePageModal';

const PageList = () => {
    const [pages, setPages] = useState([]);
    const [darkMode, setDarkMode] = useState(true);
    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const fetchPages = async () => {
        try {
            setLoading(true);
            const response = await api.get('/pages/list');
            console.log('Páginas carregadas:', response.data);
            setPages(response.data);
        } catch (error) {
            console.error('Erro ao carregar páginas:', error);
            setError('Erro ao carregar páginas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        setDarkMode(theme === 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');

        fetchPages();
    }, []);

    const handleCloneSuccess = async (pageData) => {
        setSuccess('Página clonada com sucesso!');
        await fetchPages(); // Recarrega a lista de páginas
        setIsCloneModalOpen(false);
    };

    const openClonedPage = (page) => {
        window.open(page.cloneUrl, '_blank');
    };

    const deletePage = async (pageId) => {
        if (window.confirm('Tem certeza que deseja excluir esta página?')) {
            try {
                await api.delete(`/pages/${pageId}`);
                setSuccess('Página excluída com sucesso!');
                await fetchPages(); // Recarrega a lista após excluir
            } catch (error) {
                console.error('Erro ao excluir página:', error);
                setError('Erro ao excluir página.');
            }
        }
    };

    const SidebarItem = ({ icon: Icon, text, isNew, onClick }) => (
        <div
            onClick={onClick}
            className="flex items-center p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
        >
            <Icon size={20} />
            <span className="ml-3">{text}</span>
            {isNew && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                    Novo
                </span>
            )}
        </div>
    );

    const Sidebar = () => (
        <div className="w-64 h-screen bg-white dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-700">
            <div className="mb-8">
                <h1 className="text-2xl text-gray-800 dark:text-white font-bold">Dashboard</h1>
            </div>

            <div className="space-y-2">
                <div onClick={() => navigate('/dashboard')}>
                    <SidebarItem icon={Home} text="Resumo" />
                </div>
                <SidebarItem icon={FileText} text="Tutoriais" isNew />
                <div onClick={() => navigate('/pages')}>
                    <SidebarItem icon={FileText} text="Páginas" />
                </div>
                <SidebarItem icon={Globe} text="Domínios" />
                <SidebarItem icon={Database} text="Integrações" />
                <SidebarItem icon={Users} text="Leads" />
                <SidebarItem icon={MessageSquare} text="Mensagens padrão" />
                <SidebarItem icon={HelpCircle} text="Suporte" />
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-800">
            <Sidebar />
            <div className="flex-1 p-8 overflow-auto">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Páginas Clonadas</h1>
                    <button
                        onClick={() => setIsCloneModalOpen(true)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center"
                    >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Clonar página
                    </button>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                ) : pages.length === 0 ? (
                    <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                        Nenhuma página clonada ainda.
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {pages.map((page) => (
                            <div
                                key={page.id}
                                className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                            {page.url}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Clone URL: {page.cloneUrl}
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => openClonedPage(page)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                                        >
                                            <ExternalLink className="w-5 h-5 mr-2" />
                                            Visualizar
                                        </button>
                                        <button
                                            onClick={() => navigate(`/pages/${page.id}`)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                                        >
                                            <Settings className="w-5 h-5 mr-2" />
                                            Detalhes
                                        </button>
                                        <button
                                            onClick={() => deletePage(page.id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <ClonePageModal
                    isOpen={isCloneModalOpen}
                    onClose={() => setIsCloneModalOpen(false)}
                    onCloneSuccess={handleCloneSuccess}
                />
            </div>
        </div>
    );
};

export default PageList;