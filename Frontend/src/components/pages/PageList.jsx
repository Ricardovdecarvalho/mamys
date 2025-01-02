// PageList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FileText, Home, Globe, Database, Users, MessageSquare, HelpCircle } from 'lucide-react';

const PageList = () => {
    const [pages, setPages] = useState([]);
    const [darkMode, setDarkMode] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPages = async () => {
            try {
                // GET /api/pages/list => retorna array de páginas clonadas
                const response = await axios.get('http://localhost:3002/api/pages/list');
                // Ex: response.data = [ { id, url, cloneUrl }, ... ]
                setPages(response.data);
            } catch (error) {
                console.error('Erro ao carregar páginas:', error);
            }
        };

        fetchPages();

        const theme = localStorage.getItem('theme');
        setDarkMode(theme === 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, []);

    const openClonedPage = (pageId) => {
        window.open(`http://localhost:3002/clones/${pageId}/index.html`, '_blank');
    };

    // SidebarItem para fins de exemplo
    const SidebarItem = ({ icon: Icon, text, onClick }) => (
        <div
            onClick={onClick}
            className="flex items-center p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
        >
            <Icon size={20} />
            <span className="ml-3">{text}</span>
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
                <SidebarItem icon={FileText} text="Tutoriais" />
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
            <div className="flex-1 p-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Páginas Clonadas
                </h1>

                <div className="grid gap-6">
                    {pages.map((page, index) => (
                        <div
                            key={page.id}
                            className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    {page.url}
                                </h2>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => openClonedPage(page.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Visualizar
                                    </button>
                                    <button
                                        onClick={() => navigate(`/pages/${page.id}`)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Detalhes
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PageList;
