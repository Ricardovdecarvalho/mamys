// DomainManagement.jsx
import React, { useState, useEffect } from 'react';
import {
    Home,
    Users,
    FileText,
    Globe,
    Database,
    MessageSquare,
    HelpCircle,
    Link,
    ChevronRight,
    Loader2,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header'; // Importe o Header

const systemDomains = [
    { id: 1, url: 'https://distribuidoraoficial.shop/' },
    { id: 2, url: 'https://lojadoscosmeticos.online/' }
];

const DomainManagement = () => {
    const navigate = useNavigate();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPage, setSelectedPage] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPages();
    }, []);

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
                setPages(data);
            } else {
                setError(data.error || 'Erro ao carregar páginas');
            }
        } catch (err) {
            setError('Erro ao carregar páginas');
            console.error('Erro ao carregar páginas:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDomainUpdate = async () => {
        if (!selectedPage || !selectedDomain) {
            setError('Selecione uma página e um domínio');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3002/api/pages/${selectedPage}/domain`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ domain: selectedDomain })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Domínio atualizado com sucesso!');
                setTimeout(() => {
                    navigate('/pages');  // Redirecionar para a lista de páginas
                }, 2000);
            } else {
                setError(data.error || 'Erro ao atualizar domínio');
            }
        } catch (err) {
            setError('Erro ao atualizar domínio');
            console.error('Erro ao atualizar domínio:', err);
        } finally {
            setLoading(false);
        }
    };

    const SidebarItem = ({ icon: Icon, text, isNew, active }) => (
        <div
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
                        <SidebarItem icon={FileText} text="Páginas" />
                    </div>
                    <div onClick={() => navigate('/domains')}>
                        <SidebarItem icon={Globe} text="Domínios" active={true} />
                    </div>
                    <SidebarItem icon={Database} text="Integrações" />
                    <SidebarItem icon={Users} text="Leads" />
                    <SidebarItem icon={MessageSquare} text="Mensagens padrão" />
                    <SidebarItem icon={HelpCircle} text="Suporte" />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
                <Header /> {/* Adicione o Header aqui */}

                <div className="flex-1 overflow-auto p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                            Gerenciamento de Domínios
                        </h1>

                        {/* Mensagens de erro e sucesso */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
                                <span>{error}</span>
                                <X className="cursor-pointer" size={20} onClick={() => setError('')} />
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
                                <span>{success}</span>
                                <X className="cursor-pointer" size={20} onClick={() => setSuccess('')} />
                            </div>
                        )}

                        {/* Card Principal */}
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    Domínios Disponíveis
                                </h2>

                                <div className="space-y-6">
                                    {/* Seleção de Domínio */}
                                    <div className="space-y-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Selecione um domínio:
                                        </label>
                                        <div className="space-y-2">
                                            {systemDomains.map((domain) => (
                                                <label
                                                    key={domain.id}
                                                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="domain"
                                                        value={domain.url}
                                                        checked={selectedDomain === domain.url}
                                                        onChange={(e) => setSelectedDomain(e.target.value)}
                                                        className="text-blue-600 border-gray-300 focus:ring-blue-500 h-4 w-4"
                                                    />
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {domain.url}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Seleção de Página */}
                                    <div className="space-y-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Selecione uma página:
                                        </label>
                                        <select
                                            value={selectedPage}
                                            onChange={(e) => setSelectedPage(e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Selecione uma página</option>
                                            {pages.map((page) => (
                                                <option key={page.id} value={page.id}>
                                                    {page.url}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Preview */}
                                    {selectedPage && selectedDomain && (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Preview do Domínio
                                            </h3>
                                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                <span>{selectedDomain}</span>
                                                <ChevronRight className="mx-2" size={16} />
                                                <span>{selectedPage}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Botão de Ação */}
                                    <button
                                        onClick={handleDomainUpdate}
                                        disabled={!selectedPage || !selectedDomain || loading}
                                        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${loading || !selectedPage || !selectedDomain
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            } text-white transition-colors`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2" size={20} />
                                                Atualizando...
                                            </>
                                        ) : (
                                            <>
                                                <Link className="mr-2" size={20} />
                                                Aplicar Domínio
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DomainManagement;
