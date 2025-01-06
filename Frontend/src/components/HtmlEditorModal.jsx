// ==== frontend/src/components/HtmlEditorModal.jsx ====
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/services/axios';

const HtmlEditorModal = ({ isOpen, onClose, cloneUrl, pageId }) => {
    const [htmlContent, setHtmlContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchHtmlContent();
        }
    }, [isOpen, cloneUrl]);

    const fetchHtmlContent = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/pages/${pageId}`);
            if (response.data.success) {
                // Obter o HTML clonado via fetch
                const clonedPageResponse = await fetch(response.data.page.cloneUrl);
                const clonedHtml = await clonedPageResponse.text();
                setHtmlContent(clonedHtml);
            } else {
                toast.error(`Erro ao carregar página: ${response.data.error}`);
            }
        } catch (error) {
            console.error('Erro ao carregar HTML:', error);
            toast.error('Erro ao carregar HTML da página.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const response = await api.put(`/pages/${pageId}/html`, {
                newHtml: htmlContent
            });
            if (response.data.success) {
                toast.success('HTML salvo com sucesso!');
                onClose();
            } else {
                toast.error(`Erro ao salvar HTML: ${response.data.error}`);
            }
        } catch (error) {
            console.error('Erro ao salvar HTML:', error);
            toast.error(`Erro ao salvar HTML: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 my-6 p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Editar HTML
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-4">
                        <textarea
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            className="w-full h-96 p-4 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        ></textarea>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center"
                            >
                                <X size={16} className="mr-2" />
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                            >
                                <Save size={16} className="mr-2" />
                                Salvar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HtmlEditorModal;
