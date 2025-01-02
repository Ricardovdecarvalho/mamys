// PagesManagement.jsx
import React, { useState, useEffect } from 'react';
import {
    Eye,
    Copy,
    Settings,
    Trash2,
    ExternalLink,
    Home,
    FileText,
    Globe,
    Database,
    Users,
    MessageSquare,
    HelpCircle,
    LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClonePageModal from './ClonePageModal';
import ProfileModal from './ProfileModal';
import PageConfigModal from './PageConfigModal'; // Importar o PageConfigModal
import { toast } from 'react-toastify'; // Importar o toast

const PagesManagement = () => {
    const [userRole, setUserRole] = useState('');
    const [darkMode, setDarkMode] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
    const navigate = useNavigate();

    const [pages, setPages] = useState([
        {
            id: 1,
            url: 'https://www.clickproduto.com.br/d2wu8kr',
            views: 0,
            status: 'active',
        },
        {
            id: 2,
            url: 'https://www.clickproduto.com.br/d4fk1kr',
            views: 1,
            status: 'active',
        },
        {
            id: 3,
            url: 'https://www.clickproduto.com.br/a8wi1mx',
            views: 1,
            status: 'active',
        },
    ]);

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const theme = localStorage.getItem('theme');
        if (!role) {
            navigate('/login');
        }
        setUserRole(role);
        setDarkMode(theme === 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [navigate]);

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
        toast.success(`Tema alterado para ${newTheme ? 'Dark' : 'Light'}!`);
    };

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    const handleCopyLink = async (url) => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copiado com sucesso!');
        } catch (err) {
            console.error('Erro ao copiar:', err);
            toast.error('Falha ao copiar o link.');
        }
    };

    const handleDeletePage = (pageId) => {
        if (window.confirm('Tem certeza que deseja excluir esta página?')) {
            setPages(pages.filter((page) => page.id !== pageId));
            toast.success('Página excluída com sucesso!');
        }
    };

    // Novo Estado para gerenciar o modal de configuração
    const [selectedPage, setSelectedPage] = useState(null);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

    // Função para abrir o modal de configuração da página
    const handleOpenConfigModal = (page) => {
        setSelectedPage(page);
        setIsConfigModalOpen(true);
    };

    // Componente SidebarItem
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

    // Componente Sidebar
    const Sidebar = () => (
        <div className="w-64 h-screen bg-white dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-700">
            <div className="mb-8">
                <h1 className="text-2xl text-gray-800 dark:text-white font-bold">Dashboard</h1>
            </div>

            <div className="space-y-2">
                <SidebarItem icon={Home} text="Resumo" onClick={() => navigate('/dashboard')} />
                <SidebarItem icon={FileText} text="Tutoriais" isNew={true} />
                <SidebarItem icon={FileText} text="Páginas" onClick={() => navigate('/pages')} />
                <SidebarItem icon={Globe} text="Domínios" />
                <SidebarItem icon={Database} text="Integrações" />
                <SidebarItem icon={Users} text="Leads" />
                <SidebarItem icon={MessageSquare} text="Mensagens padrão" />
                <SidebarItem icon={HelpCircle} text="Suporte" />
            </div>
        </div>
    );

    // Componente Header
    const Header = () => (
        <div className="flex justify-between items-center p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4">
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg">
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
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="relative dropdown-container">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-3 focus:outline-none"
                    >
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                            M
                        </div>
                        <div className="text-left hidden md:block">
                            <div className="text-gray-700 dark:text-white">Miqueias de Souza</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                lojavilleshopping@gmail.com
                            </div>
                        </div>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10 border dark:border-gray-700">
                            <button
                                onClick={() => {
                                    setIsProfileModalOpen(true);
                                    setIsDropdownOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Meus dados
                            </button>
                            <button
                                onClick={handleThemeChange}
                                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Alternar tema
                            </button>
                            <button
                                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Financeiro
                            </button>
                            <button
                                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Meu plano
                            </button>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Sair da conta
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-800">
            <Sidebar />

            <div className="flex-1 overflow-auto">
                <Header />

                <div className="p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Páginas</h1>
                            <div>
                                <button
                                    onClick={() => setIsCloneModalOpen(true)}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center"
                                >
                                    <ExternalLink className="w-5 h-5 mr-2" />
                                    Clonar página
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <a
                                href="#"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                            >
                                <span className="mr-2">Tutorial: Como clonar e configurar uma página</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>

                        <div className="space-y-4">
                            {pages.map((page) => (
                                <div key={page.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <a
                                            href={page.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-orange-500 hover:text-orange-600 break-all"
                                        >
                                            {page.url}
                                        </a>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleCopyLink(page.url)}
                                                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                title="Copiar link"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenConfigModal(page)} // Abrir o modal de configuração
                                                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                title="Configurações"
                                            >
                                                <Settings className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePage(page.id)}
                                                className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <div className="flex items-center text-gray-600 dark:text-gray-400 ml-4">
                                                <Eye className="w-5 h-5 mr-1" />
                                                <span>{page.views}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modais existentes */}
            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

            <ClonePageModal isOpen={isCloneModalOpen} onClose={() => setIsCloneModalOpen(false)} />

            {/* Novo Modal de Configuração da Página */}
            <PageConfigModal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                pageData={selectedPage}
            />
        </div>
    );
};

export default PagesManagement;
