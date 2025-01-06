// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Users, FileText, Link, Home, MessageSquare, HelpCircle, Globe, Database, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/axios';
import ProfileModal from '@/components/ProfileModal';
import ClonePageModal from '@/components/ClonePageModal';



const Dashboard = () => {
    const [userRole, setUserRole] = useState('');
    const [darkMode, setDarkMode] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
    const [clonedPages, setClonedPages] = useState([]);
    const [feedback, setFeedback] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    // Dados do usuário
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPages = async () => {
            try {
                const response = await api.get('/pages/list');
                setClonedPages(response.data);
            } catch (error) {
                console.error('Erro ao carregar páginas clonadas:', error);
            }
        };
        fetchPages();

        const role = localStorage.getItem('userRole');
        const theme = localStorage.getItem('theme');
        if (!role) {
            navigate('/login');
        }
        setUserRole(role);
        setDarkMode(theme === 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [navigate, refreshKey]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleThemeChange = () => {
        const newTheme = !darkMode;
        setDarkMode(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newTheme);
        setIsDropdownOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleClonePage = () => {
        setIsCloneModalOpen(true);
    };

    const handleCloneSuccess = (pageData) => {
        setFeedback('Página clonada com sucesso!');
        window.open(pageData.cloneUrl, '_blank');
        setRefreshKey(old => old + 1); // Força atualização da lista
        setClonedPages(prev => [pageData, ...prev]); // Atualiza lista imediatamente
    };

    const stats = {
        commission: 'R$ 0,00',
        pendingTransactions: 0,
        completedTransactions: 0,
        pageViews: 0
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

    const Header = () => (
        <div className="flex justify-between items-center p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4">
                <button
                    onClick={() => navigate('/pages')}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    Páginas
                </button>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg">
                    Domínios
                </button>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg">
                    Integração
                </button>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg">
                    Leads
                </button>
            </div>

            <div className="relative dropdown-container">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-3 focus:outline-none"
                >
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        {userData.firstName ? userData.firstName[0].toUpperCase() : 'U'}
                    </div>
                    <div className="text-left hidden md:block">
                        <div className="text-gray-700 dark:text-white font-medium">
                            {fullName || 'Usuário'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {userData.email || 'email@example.com'}
                        </div>
                    </div>
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="font-semibold text-gray-900 dark:text-white">
                                {fullName || 'Usuário'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {userData.email || 'email@example.com'}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setIsDropdownOpen(false);
                                setIsProfileModalOpen(true);
                            }}
                            className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                            Meus dados
                        </button>

                        <button
                            onClick={handleThemeChange}
                            className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                            {darkMode ? 'Modo claro' : 'Modo escuro'}
                        </button>

                        <button
                            disabled
                            className="block w-full text-left px-4 py-2 text-gray-400 dark:text-gray-500 hover:cursor-not-allowed"
                        >
                            Financeiro
                        </button>

                        <button
                            disabled
                            className="block w-full text-left px-4 py-2 text-gray-400 dark:text-gray-500 hover:cursor-not-allowed"
                        >
                            Meu plano
                        </button>

                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                            Sair da conta
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const StatsCard = ({ title, value, icon: Icon }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-500 dark:text-gray-400">{title}</h3>
                <Icon className="text-gray-500 dark:text-gray-400" size={24} />
            </div>
            <div className="text-2xl text-gray-800 dark:text-white">{value}</div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-800">
            <Sidebar />

            <div className="flex-1 overflow-auto">
                <Header />

                <div className="p-6">
                    {feedback && (
                        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
                            {feedback}
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-2xl text-gray-800 dark:text-white mb-4">
                            Primeiros passos
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Vamos configurar sua estrutura? Aqui estão alguns atalhos para você começar:
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={handleClonePage}
                                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Clonar Página
                            </button>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl text-gray-800 dark:text-white mb-6">Resumo da sua conta</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatsCard
                                title="COMISSÃO (ESTE MÊS)"
                                value={stats.commission}
                                icon={Link}
                            />
                            <StatsCard
                                title="TRANSAÇÕES"
                                value={`${stats.pendingTransactions} pendentes / ${stats.completedTransactions} convertidas`}
                                icon={Filter}
                            />
                            <StatsCard
                                title="VISUALIZAÇÕES DE PÁGINAS (ESTE MÊS)"
                                value={stats.pageViews}
                                icon={Users}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />

            <ClonePageModal
                isOpen={isCloneModalOpen}
                onClose={() => setIsCloneModalOpen(false)}
                onCloneSuccess={handleCloneSuccess}
            />
        </div>
    );
};

export default Dashboard;