// PageList.jsx
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClonePageModal from '../ClonePageModal';
import Header from '../Header'; // Ajuste o caminho conforme a estrutura do seu projeto
import ProfileModal from '../ProfileModal'; // Certifique-se de ter este componente

const PageList = () => {
    // Estados para o Header
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [darkMode, setDarkMode] = useState(true);

    // Outros estados existentes
    const [pages, setPages] = useState([]);
    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    // Dados do usuário
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();

    const fetchPages = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3002/api/pages/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                // Processar páginas para usar o domínio correto se estiver configurado
                const processedPages = data.map(page => ({
                    ...page,
                    displayUrl: page.domain
                        ? `${page.domain}${page._id}`  // Usar o domínio personalizado
                        : page.cloneUrl                // Fallback para a URL original
                }));
                setPages(processedPages);
            } else {
                setError(data.error || 'Erro ao carregar páginas');
            }
        } catch (error) {
            console.error('Erro ao carregar páginas:', error);
            setError('Erro ao carregar páginas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        setDarkMode(theme === 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');

        const role = localStorage.getItem('userRole');
        if (!role) {
            navigate('/login');
        }
        setUserRole(role);

        fetchPages();
    }, [navigate]);

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

    const handleCloneSuccess = async (pageData) => {
        setSuccess('Página clonada com sucesso!');
        await fetchPages();
        setIsCloneModalOpen(false);
    };

    const openClonedPage = (page) => {
        window.open(page.displayUrl || page.cloneUrl, '_blank');
    };

    const handleCopyLink = async (url) => {
        try {
            await navigator.clipboard.writeText(url);
            setSuccess('Link copiado com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erro ao copiar link');
            console.error('Erro ao copiar:', err);
        }
    };

    const deletePage = async (pageId) => {
        if (window.confirm('Tem certeza que deseja excluir esta página?')) {
            try {
                await fetch(`http://localhost:3002/api/pages/${pageId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setSuccess('Página excluída com sucesso!');
                await fetchPages();
            } catch (error) {
                console.error('Erro ao excluir página:', error);
                setError('Erro ao excluir página');
            }
        }
    };

    const SidebarItem = ({ icon: Icon, text, isNew, onClick, active }) => (
        <div
            onClick={onClick}
            className={`flex items-center p-3 ${active
                ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                } rounded-lg cursor-pointer transition-colors duration-200`}
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

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-800">
            {/* Sidebar */}
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
                        <SidebarItem icon={FileText} text="Páginas" active={true} />
                    </div>
                    <div onClick={() => navigate('/domains')}>
                        <SidebarItem icon={Globe} text="Domínios" />
                    </div>
                    <SidebarItem icon={Database} text="Integrações" />
                    <SidebarItem icon={Users} text="Leads" />
                    <SidebarItem icon={MessageSquare} text="Mensagens padrão" />
                    <SidebarItem icon={HelpCircle} text="Suporte" />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {/* Header */}
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

                <div className="p-8">
                    {/* Feedback Messages */}
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

                    {/* Título e Botão de Clonagem */}
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

                    {/* Conteúdo Principal */}
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
                                                URL da Página: {page.displayUrl || page.cloneUrl}
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
                                                onClick={() => handleCopyLink(page.displayUrl || page.cloneUrl)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                                            >
                                                <Copy className="w-5 h-5 mr-2" />
                                                Copiar Link
                                            </button>
                                            <button
                                                onClick={() => navigate(`/pages/${page.id}`)}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
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

                    {/* Modais */}
                    <ClonePageModal
                        isOpen={isCloneModalOpen}
                        onClose={() => setIsCloneModalOpen(false)}
                        onCloneSuccess={handleCloneSuccess}
                    />
                    <ProfileModal
                        isOpen={isProfileModalOpen}
                        onClose={() => setIsProfileModalOpen(false)}
                    />
                </div>
            </div>
        </div>
    );
};

export default PageList;
