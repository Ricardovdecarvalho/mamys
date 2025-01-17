// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Users, FileText, Link, Home, MessageSquare, HelpCircle, Globe, Database, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/axios';
import ProfileModal from '@/components/ProfileModal';
import ClonePageModal from '@/components/ClonePageModal';
import Header from '@/components/Header'; // Importando o Header

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

    const SidebarItem = ({ icon: Icon, text, isNew, active, onClick }) => (
        <div
            onClick={onClick}
            className={`flex items-center p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer ${active ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
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
                    <SidebarItem icon={Home} text="Resumo" active={true} />
                </div>
                <SidebarItem icon={FileText} text="Tutoriais" isNew={true} />
                <div onClick={() => navigate('/pages')}>
                    <SidebarItem icon={FileText} text="Páginas" />
                </div>
                <div onClick={() => navigate('/domains')}>
                    <SidebarItem icon={Globe} text="Domínios" />
                </div>
                <div onClick={() => navigate('/integrations')}>
                    <SidebarItem icon={Database} text="Integrações" />
                </div>
                <div onClick={() => navigate('/leads')}>
                    <SidebarItem icon={Users} text="Leads" />
                </div>
                <div onClick={() => navigate('/messages')}>
                    <SidebarItem icon={MessageSquare} text="Mensagens padrão" />
                </div>
                <div onClick={() => navigate('/support')}>
                    <SidebarItem icon={HelpCircle} text="Suporte" />
                </div>
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
                {/* Importando o Header e passando as props necessárias */}
                <Header
                    userData={userData}
                    fullName={fullName}
                    isDropdownOpen={isDropdownOpen}
                    setIsDropdownOpen={setIsDropdownOpen}
                    darkMode={darkMode}
                    handleThemeChange={handleThemeChange}
                    handleLogout={handleLogout}
                    setIsProfileModalOpen={setIsProfileModalOpen}
                />

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