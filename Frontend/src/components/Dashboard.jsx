// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Users, FileText, Link, Home, MessageSquare, HelpCircle, Globe, Database, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Se você tiver estes dois modais:
import ProfileModal from './ProfileModal';
import ClonePageModal from './ClonePageModal';

const Dashboard = () => {
    const [userRole, setUserRole] = useState('');
    const [darkMode, setDarkMode] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);

    // Array de páginas clonadas — caso precise para outra lógica,
    // mas não exibiremos no sidebar
    const [clonedPages, setClonedPages] = useState([]);

    // Apenas para mostrar alguma mensagem de feedback (opcional)
    const [feedback, setFeedback] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        // Carrega páginas clonadas ao montar (se quiser usar em outro lugar)
        const fetchPages = async () => {
            try {
                // GET /api/pages/list retorna um array de páginas
                const response = await axios.get('http://localhost:3002/api/pages/list');
                setClonedPages(response.data); // Ex: [{ id, url, cloneUrl }, ...]
            } catch (error) {
                console.error('Erro ao carregar páginas clonadas:', error);
            }
        };

        fetchPages();

        // Verifica role do usuário e tema
        const role = localStorage.getItem('userRole');
        const theme = localStorage.getItem('theme');
        if (!role) {
            navigate('/login');
        }
        setUserRole(role);
        setDarkMode(theme === 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [navigate]);

    // Fecha dropdown ao clicar fora (se estiver usando menus suspensos)
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

    // Alterna tema
    const handleThemeChange = () => {
        const newTheme = !darkMode;
        setDarkMode(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newTheme);
        setIsDropdownOpen(false);
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    // Abre modal de clonagem
    const handleClonePage = () => {
        setIsCloneModalOpen(true);
    };

    // Quando a clonagem é bem-sucedida no modal
    const handleCloneSuccess = (pageData) => {
        // pageData = { id, url, cloneUrl } retornado pelo backend
        setFeedback('Página clonada com sucesso!');

        // Abre imediatamente em outra aba
        window.open(pageData.cloneUrl, '_blank');

        // Adiciona no array, se ainda não existir
        const exists = clonedPages.find((p) => p.id === pageData.id);
        if (!exists) {
            setClonedPages((prev) => [pageData, ...prev]);
        }
    };

    // Exemplo de estatísticas fictícias
    const stats = {
        commission: 'R$ 0,00',
        pendingTransactions: 0,
        completedTransactions: 0,
        pageViews: 0
    };

    // Item do Sidebar
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

    // Barra lateral (sem exibir páginas clonadas)
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

    // Cabeçalho
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

            <div className="flex items-center space-x-4">
                <div className="flex items-center mr-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">
                        {darkMode ? 'Dark' : 'Light'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={darkMode}
                            onChange={handleThemeChange}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 
              dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full 
              peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
              after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
              after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );

    // Cartão de estatísticas
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
                        <h2 className="text-2xl text-gray-800 dark:text-white mb-4">Primeiros passos</h2>
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

            {/* Modais (opcionais) */}
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
