import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Settings, Users, FileText, Link, Home, MessageSquare, HelpCircle,
    Globe, Database, Filter, LogOut
} from 'lucide-react';

const PageDetails = () => {
    const { id } = useParams();
    const [pageData, setPageData] = useState(null);
    const [darkMode, setDarkMode] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        setDarkMode(theme === 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');

        const fetchPageDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3002/api/pages/list`);
                const page = response.data.find(p => p.id === id);
                setPageData(page);
            } catch (error) {
                console.error('Erro ao carregar página:', error);
            }
        };

        fetchPageDetails();
    }, [id]);

    const handleThemeChange = () => {
        const newTheme = !darkMode;
        setDarkMode(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newTheme);
    };

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
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
                <SidebarItem icon={FileText} text="Tutoriais" isNew={true} />
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
            </div>
        </div>
    );

    if (!pageData) return <div>Carregando...</div>;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-800">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <Header />
                <div className="p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                            Detalhes da Página
                        </h1>

                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                ID: {pageData.id}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                URL Original: {pageData.url}
                            </p>
                            <div className="mt-4">
                                <a
                                    href={`http://localhost:3002/clones/${id}/index.html`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Visualizar Página Clonada
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageDetails;