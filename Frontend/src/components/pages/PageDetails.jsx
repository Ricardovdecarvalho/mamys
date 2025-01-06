// components/PageDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/axios';
import {
    Settings, Users, FileText, Link, Home, MessageSquare, HelpCircle,
    Globe, Database, Filter, LogOut, Plus, Trash2, Edit2, Save, X, Image
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import HtmlEditorModal from '../HtmlEditorModal';
import ImageEditorModal from '../ImageEditorModal';

const PageDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Estados
    const [pageData, setPageData] = useState(null);
    const [darkMode, setDarkMode] = useState(true);

    // PIXEL
    const [pixelId, setPixelId] = useState('');
    const [showPixelInput, setShowPixelInput] = useState(false);

    // SCRIPTS
    const [scripts, setScripts] = useState([]);
    const [showScriptInput, setShowScriptInput] = useState(false);
    const [newScriptContent, setNewScriptContent] = useState('');
    const [newScriptLocation, setNewScriptLocation] = useState('head');

    // LINKS
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [links, setLinks] = useState([]);
    const [loadingLinks, setLoadingLinks] = useState(false);
    const [editingLinkIndex, setEditingLinkIndex] = useState(null);
    const [editingHref, setEditingHref] = useState('');

    // HTML Editor
    const [isHtmlEditorOpen, setIsHtmlEditorOpen] = useState(false);

    // Image Editor
    const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);

    // Carrega detalhes da página
    useEffect(() => {
        const theme = localStorage.getItem('theme');
        setDarkMode(theme === 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');

        const fetchPageDetails = async () => {
            try {
                const response = await api.get(`/pages/${id}`);
                if (response.data.success) {
                    setPageData(response.data.page);
                    setScripts(response.data.page.scripts || []);
                } else {
                    toast.error(`Erro ao carregar página: ${response.data.error}`);
                }
            } catch (error) {
                console.error('Erro ao carregar página:', error);
                toast.error('Erro ao carregar dados da página');
            }
        };

        fetchPageDetails();
    }, [id]);

    // Alterna tema dark / light
    const handleThemeChange = () => {
        const newTheme = !darkMode;
        setDarkMode(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newTheme);
    };

    // Abre a página clonada
    const openClonedPage = (page) => {
        window.open(page.cloneUrl, '_blank');
    };

    // PIXEL - Adicionar
    const handlePixelSubmit = async () => {
        const trimmedPixelId = pixelId.trim();
        const pixelIdRegex = /^\d{15}$/;

        if (!pixelIdRegex.test(trimmedPixelId)) {
            toast.error('Por favor, insira um ID de pixel válido (15 dígitos numéricos).');
            return;
        }

        try {
            const response = await api.post(`/pages/${id}/pixel`, { pixelId: trimmedPixelId });
            if (response.data.success) {
                toast.success('Pixel adicionado com sucesso!');
                setShowPixelInput(false);
                setPixelId('');
                setPageData((prev) => ({ ...prev, pixelId: trimmedPixelId }));
            } else {
                toast.error(`Erro ao adicionar pixel: ${response.data.error}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar pixel:', error);
            toast.error(`Erro ao adicionar pixel: ${error.response?.data?.error || error.message}`);
        }
    };

    // PIXEL - Remover
    const handleRemovePixel = async () => {
        if (!window.confirm('Tem certeza de que deseja remover o Pixel do Facebook desta página?')) {
            return;
        }

        try {
            const response = await api.delete(`/pages/${id}/pixel`);
            if (response.data.success) {
                toast.success('Pixel removido com sucesso!');
                setPageData((prev) => ({ ...prev, pixelId: null }));
            } else {
                toast.error(`Erro ao remover pixel: ${response.data.error}`);
            }
        } catch (error) {
            console.error('Erro ao remover pixel:', error);
            toast.error(`Erro ao remover pixel: ${error.response?.data?.error || error.message}`);
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    // SCRIPTS - Adicionar
    const handleAddScript = async () => {
        if (!newScriptContent.trim()) {
            toast.error('O conteúdo do script não pode estar vazio.');
            return;
        }

        try {
            const response = await api.post(`/pages/${id}/scripts`, {
                content: newScriptContent,
                location: newScriptLocation,
            });

            if (response.data.success) {
                toast.success('Script adicionado com sucesso!');
                setScripts((prev) => [...prev, response.data.script]);
                setShowScriptInput(false);
                setNewScriptContent('');
                setNewScriptLocation('head');
            } else {
                toast.error(`Erro ao adicionar script: ${response.data.error}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar script:', error);
            toast.error(`Erro ao adicionar script: ${error.response?.data?.error || error.message}`);
        }
    };


    // Função handleRemoveScript
    const handleRemoveScript = async (scriptId) => {
        if (!scriptId) {
            console.error('ID do script não fornecido');
            toast.error('ID do script não fornecido');
            return;
        }

        try {
            const response = await api.delete(`/pages/${id}/scripts/${scriptId}`);

            if (response.data.success) {
                setScripts((prevScripts) =>
                    prevScripts.filter((script) => script._id !== scriptId)
                );
                toast.success('Script removido com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao remover script:', error);
            toast.error(error.response?.data?.error || 'Erro ao remover script');
        }
    };

    // LINKS - Abrir modal
    const openLinkModal = async () => {
        setIsLinkModalOpen(true);
        setLoadingLinks(true);
        try {
            const response = await api.get(`/pages/${id}/links`);
            if (response.data.success) {
                setLinks(response.data.links);
            } else {
                toast.error(`Erro ao carregar links: ${response.data.error}`);
            }
        } catch (error) {
            console.error('Erro ao carregar links:', error);
            toast.error(`Erro ao carregar links: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoadingLinks(false);
        }
    };

    // LINKS - Fechar modal
    const closeLinkModal = () => {
        setIsLinkModalOpen(false);
        setLinks([]);
        setEditingLinkIndex(null);
        setEditingHref('');
    };

    // LINKS - Editar
    const startEditingLink = (index, currentHref) => {
        setEditingLinkIndex(index);
        setEditingHref(currentHref);
    };

    const cancelEditingLink = () => {
        setEditingLinkIndex(null);
        setEditingHref('');
    };

    const saveEditedLink = async () => {
        if (editingLinkIndex === null) return;

        const isValidURL = (string) => {
            try {
                new URL(string);
                return true;
            } catch (_) {
                return false;
            }
        };

        if (!isValidURL(editingHref)) {
            toast.error('Por favor, insira uma URL válida.');
            return;
        }

        try {
            const response = await api.put(`/pages/${id}/links/${editingLinkIndex}`, {
                href: editingHref,
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setLinks((prevLinks) =>
                    prevLinks.map((link) => {
                        if (link.index === editingLinkIndex) {
                            return { ...link, href: editingHref };
                        }
                        return link;
                    })
                );
                setEditingLinkIndex(null);
                setEditingHref('');
            } else {
                toast.error(`Erro ao atualizar link: ${response.data.error}`);
            }
        } catch (error) {
            console.error('Erro ao atualizar link:', error);
            toast.error(`Erro ao atualizar link: ${error.response?.data?.error || error.message}`);
        }
    };

    // SidebarItem
    const SidebarItem = ({ icon: Icon, text, isNew, onClick }) => (
        <div
            onClick={onClick}
            className="flex items-center p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors duration-200"
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

    // Sidebar
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
                <SidebarItem icon={LogOut} text="Logout" onClick={handleLogout} />
            </div>
        </div>
    );

    // Header
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

    // Render principal
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
                            {/* Dados da página */}
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                <strong>ID:</strong> {pageData.id}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                <strong>URL Original:</strong> {pageData.url}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                <strong>Clone URL:</strong>{' '}
                                <a
                                    href={pageData.cloneUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    {pageData.cloneUrl}
                                </a>
                            </p>

                            {/* PIXEL FACEBOOK & HTML EDITOR */}
                            <div className="mb-4">
                                {pageData.pixelId ? (
                                    <div className="mb-4">
                                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                                            <strong>Pixel Facebook ID:</strong> {pageData.pixelId}
                                        </p>
                                        <button
                                            onClick={handleRemovePixel}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
                                        >
                                            <Trash2 size={16} className="mr-2" />
                                            Remover Pixel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mb-4">
                                        <button
                                            onClick={() => setShowPixelInput(!showPixelInput)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                                        >
                                            <Plus size={16} className="mr-2" />
                                            Adicionar Pixel Facebook
                                        </button>
                                    </div>
                                )}

                                {/* Formulário para Adicionar Pixel */}
                                {showPixelInput && (
                                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-600 rounded-lg">
                                        <label className="block mb-2 text-gray-700 dark:text-gray-300">
                                            ID do Pixel Facebook:
                                        </label>
                                        <input
                                            type="text"
                                            value={pixelId}
                                            onChange={(e) => setPixelId(e.target.value)}
                                            placeholder="123456789012345"
                                            className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                        />
                                        <div className="mt-2 flex space-x-2">
                                            <button
                                                onClick={handlePixelSubmit}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                                            >
                                                <Save size={16} className="mr-2" />
                                                Salvar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowPixelInput(false);
                                                    setPixelId('');
                                                }}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center"
                                            >
                                                <X size={16} className="mr-2" />
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Botões de Edição */}
                                <div className="mt-4 space-x-4 flex items-center">
                                    <button
                                        onClick={() => setIsHtmlEditorOpen(true)}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center"
                                    >
                                        <Edit2 size={16} className="mr-2" />
                                        Editar HTML
                                    </button>

                                    <button
                                        onClick={() => setIsImageEditorOpen(true)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                                    >
                                        <Image size={16} className="mr-2" />
                                        Gerenciar Imagens
                                    </button>
                                </div>
                            </div>

                            {/* SCRIPTS PERSONALIZADOS */}
                            <div className="mb-4">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                                    Scripts Personalizados
                                </h2>

                                {/* Lista de scripts */}
                                {scripts.length > 0 ? (
                                    <ul className="space-y-2">
                                        {scripts.map((script) => (
                                            <li
                                                key={script._id} // Certifique-se de que script._id é único e definido
                                                className="flex justify-between items-center bg-gray-100 dark:bg-gray-600 p-3 rounded-lg"
                                            >
                                                <div>
                                                    <p className="text-gray-700 dark:text-gray-200">
                                                        <strong>Localização:</strong> {script.location.toUpperCase()}
                                                    </p>
                                                    <pre className="text-sm text-gray-600 dark:text-gray-300 overflow-auto">
                                                        {script.content}
                                                    </pre>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveScript(script._id)}
                                                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                                    title="Remover Script"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-300">Nenhum script adicionado.</p>
                                )}

                                {/* Botão para mostrar/esconder form de adicionar script */}
                                <button
                                    onClick={() => setShowScriptInput(!showScriptInput)}
                                    className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Adicionar Novo Script
                                </button>

                                {/* Form para adicionar novo script */}
                                {showScriptInput && (
                                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-600 rounded-lg">
                                        <label className="block mb-2 text-gray-700 dark:text-gray-300">
                                            Conteúdo do Script:
                                        </label>
                                        <textarea
                                            value={newScriptContent}
                                            onChange={(e) => setNewScriptContent(e.target.value)}
                                            placeholder="<script>...</script>"
                                            className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                            rows={4}
                                        ></textarea>

                                        <label className="block mt-2 mb-2 text-gray-700 dark:text-gray-300">
                                            Localização:
                                        </label>
                                        <select
                                            value={newScriptLocation}
                                            onChange={(e) => setNewScriptLocation(e.target.value)}
                                            className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                        >
                                            <option value="head">Head</option>
                                            <option value="body">Body</option>
                                        </select>

                                        <div className="mt-2 flex space-x-2">
                                            <button
                                                onClick={handleAddScript}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                                            >
                                                <Save size={16} className="mr-2" />
                                                Adicionar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowScriptInput(false);
                                                    setNewScriptContent('');
                                                    setNewScriptLocation('head');
                                                }}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center"
                                            >
                                                <X size={16} className="mr-2" />
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* LINKS */}
                            <div className="mb-4">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                                    Gerenciamento de Links
                                </h2>
                                <button
                                    onClick={openLinkModal}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center"
                                >
                                    <Link size={16} className="mr-2" />
                                    Gerenciar Links
                                </button>
                            </div>

                            {/* MODAL de LINKS */}
                            <Modal
                                open={isLinkModalOpen}
                                onClose={closeLinkModal}
                                center
                                showCloseIcon={false}
                                classNames={{
                                    modal: 'max-w-3xl w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto',
                                }}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                                        Gerenciar Links
                                    </h2>
                                    <button
                                        onClick={closeLinkModal}
                                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {loadingLinks ? (
                                    <div className="text-center text-gray-600 dark:text-gray-300">
                                        Carregando links...
                                    </div>
                                ) : links.length === 0 ? (
                                    <div className="text-center text-gray-600 dark:text-gray-300">
                                        Nenhum link encontrado.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {links.map((link) => (
                                            <div
                                                key={link._id || link.index} // Use '_id' preferencialmente
                                                className="flex flex-nowrap items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
                                            >
                                                <div className="flex-1 min-w-0 mr-4">
                                                    <p
                                                        className="font-medium text-gray-800 dark:text-gray-200 truncate"
                                                        title={link.text || 'Sem Texto'}
                                                    >
                                                        <strong>Texto:</strong> {link.text || 'Sem Texto'}
                                                    </p>
                                                    <p
                                                        className="text-gray-600 dark:text-gray-400 truncate"
                                                        title={link.href}
                                                    >
                                                        <strong>Href:</strong> {link.href}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {editingLinkIndex === link.index ? (
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="text"
                                                                value={editingHref}
                                                                onChange={(e) => setEditingHref(e.target.value)}
                                                                className="px-3 py-2 rounded-lg border dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Digite o novo href"
                                                            />
                                                            <button
                                                                onClick={saveEditedLink}
                                                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                                                            >
                                                                <Save size={16} className="mr-2" />
                                                                Salvar
                                                            </button>
                                                            <button
                                                                onClick={cancelEditingLink}
                                                                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center"
                                                            >
                                                                <X size={16} className="mr-2" />
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => startEditingLink(link.index, link.href)}
                                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                                                        >
                                                            <Edit2 size={16} className="mr-2" />
                                                            Editar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Modal>
                            {/* Fim do modal de links */}

                            {/* BOTÃO P/ VISUALIZAR CLONE */}
                            <div className="mt-4 space-x-4 flex items-center">
                                <button
                                    onClick={() => openClonedPage(pageData)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                                >
                                    <Link size={16} className="mr-2" />
                                    Visualizar Página Clonada
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Renderizar o Modal de Edição HTML */}
            <HtmlEditorModal
                isOpen={isHtmlEditorOpen}
                onClose={() => setIsHtmlEditorOpen(false)}
                cloneUrl={pageData.cloneUrl}
                pageId={id}
            />

            {/* Renderizar o Modal de Edição de Imagens */}
            <ImageEditorModal
                isOpen={isImageEditorOpen}
                onClose={() => setIsImageEditorOpen(false)}
                pageId={id}
            />
        </div>
    );
};

export default PageDetails;
