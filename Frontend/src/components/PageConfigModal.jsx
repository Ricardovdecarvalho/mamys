// PageConfigModal.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Copy } from 'lucide-react';
import { toast } from 'react-toastify'; // Importar toast para notificações

const PageConfigModal = ({ isOpen, onClose, pageData }) => {
    const [section, setSection] = useState(null); // Estado para controlar a seção expandida
    const [formData, setFormData] = useState({
        domain: 'www.clickproduto.com.br',
        pagePath: pageData?.path || '',
        buttons: {},
        pixels: {},
        cookieTracking: {},
        replacementLinks: {},
        pageEdits: {},
        leadCapture: {},
        filters: {},
        advanced: {},
    });

    useEffect(() => {
        // Atualizar formData quando pageData muda
        if (pageData) {
            setFormData((prevData) => ({
                ...prevData,
                pagePath: pageData.path || '',
                // Você pode adicionar mais campos conforme necessário
            }));
        }
    }, [pageData]);

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Link copiado com sucesso!');
        } catch (err) {
            console.error('Erro ao copiar:', err);
            toast.error('Falha ao copiar o link.');
        }
    };

    if (!isOpen) return null;

    const sections = [
        { id: 'link', title: 'Link da página' },
        { id: 'buttons', title: 'Botões de contato' },
        { id: 'pixels', title: 'Pixels' },
        { id: 'cookie', title: 'Marcação do cookie de comissão' },
        { id: 'links', title: 'Links para substituir' },
        { id: 'edits', title: 'Edições na página' },
        { id: 'leads', title: 'Captação de leads' },
        { id: 'filters', title: 'Filtros' },
        { id: 'advanced', title: 'Avançado' },
    ];

    const mainUrl = `https://www.clickproduto.com.br/${pageData?.id}`;
    const sellUrl = `https://www.clickproduto.com.br/${pageData?.id}/sell`;

    const toggleSection = (secId) => {
        setSection(section === secId ? null : secId);
    };

    // Função para salvar alterações (implementação fictícia)
    const handleSaveChanges = () => {
        // Implemente a lógica para salvar as alterações aqui
        toast.success('Alterações salvas com sucesso!');
        onClose();
    };

    // Função para deletar a página (implementação fictícia)
    const handleDeletePage = () => {
        if (window.confirm('Tem certeza que deseja deletar esta página?')) {
            // Implemente a lógica para deletar a página aqui
            toast.success('Página deletada com sucesso!');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
            <div className="bg-gray-900 rounded-lg w-full max-w-4xl mx-4 my-6">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white">Gerenciar página</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {/* Links Section */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Link da sua página:</p>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={mainUrl}
                                    readOnly
                                    className="flex-1 bg-gray-800 text-white p-2 rounded border border-gray-700"
                                />
                                <button
                                    onClick={() => handleCopy(mainUrl)}
                                    className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white hover:bg-gray-700"
                                    title="Copiar link"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-400 mb-2">Link pre sell:</p>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={sellUrl}
                                    readOnly
                                    className="flex-1 bg-gray-800 text-white p-2 rounded border border-gray-700"
                                />
                                <button
                                    onClick={() => handleCopy(sellUrl)}
                                    className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white hover:bg-gray-700"
                                    title="Copiar link pre sell"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Configurações Section */}
                    <div className="mb-6">
                        <h3 className="text-white text-lg font-medium mb-4 flex items-center">
                            <Settings className="w-5 h-5 mr-2" />
                            Configurações da página
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Todas as configurações da sua página podem ser gerenciadas por aqui.
                            Personalize sua página de acordo com suas preferências e estratégias.
                        </p>
                    </div>

                    {/* Configuration Sections */}
                    <div className="space-y-2">
                        {sections.map((sec) => (
                            <div key={sec.id} className="bg-gray-800 rounded-lg overflow-hidden">
                                <button
                                    className="w-full p-4 text-left text-gray-300 hover:bg-gray-700 transition-colors flex justify-between items-center"
                                    onClick={() => toggleSection(sec.id)}
                                >
                                    {sec.title}
                                    <svg
                                        className={`w-5 h-5 transform transition-transform ${section === sec.id ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>
                                {/* Conteúdo da Seção Expandida */}
                                {section === sec.id && (
                                    <div className="p-4 text-gray-300">
                                        {/* Aqui você pode adicionar os formulários ou conteúdo específico de cada seção */}
                                        <p>Conteúdo da seção: {sec.title}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between mt-6 pt-6 border-t border-gray-700">
                        <button
                            onClick={handleDeletePage}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Deletar página
                        </button>
                        <div className="space-x-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Salvar alterações
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageConfigModal;
