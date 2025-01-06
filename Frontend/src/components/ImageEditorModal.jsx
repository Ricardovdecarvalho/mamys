// ==== frontend/src/components/ImageEditorModal.jsx ====
import React, { useState, useEffect } from 'react';
import { X, Upload, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/services/axios';

const ImageEditorModal = ({ isOpen, onClose, pageId }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingIndex, setUploadingIndex] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchImages();
        }
    }, [isOpen, pageId]);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/pages/${pageId}/images`);
            if (response.data.success) {
                setImages(response.data.images);
            } else {
                toast.error(`Erro ao carregar imagens: ${response.data.error}`);
            }
        } catch (error) {
            console.error('Erro ao carregar imagens:', error);
            toast.error(`Erro ao carregar imagens: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (index, file) => {
        if (!file) {
            toast.error('Nenhum arquivo selecionado.');
            return;
        }

        // Verificar se o arquivo é uma imagem
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione um arquivo de imagem válido.');
            return;
        }

        try {
            setUploadingIndex(index);

            // Converter arquivo para base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    const response = await api.post(`/pages/${pageId}/images/${index}`, {
                        imageData: reader.result
                    });

                    if (response.data.success) {
                        toast.success('Imagem substituída com sucesso!');
                        fetchImages(); // Recarregar lista de imagens
                    } else {
                        toast.error(`Erro ao substituir imagem: ${response.data.error}`);
                    }
                } catch (error) {
                    console.error('Erro ao enviar imagem:', error);
                    toast.error(`Erro ao substituir imagem: ${error.response?.data?.error || error.message}`);
                } finally {
                    setUploadingIndex(null);
                }
            };

            reader.onerror = () => {
                console.error('Erro ao ler o arquivo.');
                toast.error('Erro ao ler o arquivo.');
                setUploadingIndex(null);
            };
        } catch (error) {
            console.error('Erro ao processar imagem:', error);
            toast.error('Erro ao processar imagem.');
            setUploadingIndex(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 my-6 p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Gerenciar Imagens
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
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando imagens...</p>
                    </div>
                ) : images.length === 0 ? (
                    <div className="text-center text-gray-600 dark:text-gray-300">
                        Nenhuma imagem encontrada.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className="border dark:border-gray-700 rounded-lg p-4"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={image.src.startsWith('http') ? image.src : `http://localhost:3002${image.src}`}
                                            alt={image.alt}
                                            className="max-w-[200px] max-h-[200px] object-contain"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            <strong>Dimensões:</strong> {image.dimensions.width} x {image.dimensions.height}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            <strong>Alt:</strong> {image.alt || 'N/A'}
                                        </p>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(index, e.target.files[0])}
                                                className="hidden"
                                                id={`image-upload-${index}`}
                                            />
                                            <label
                                                htmlFor={`image-upload-${index}`}
                                                className={`inline-flex items-center px-4 py-2 rounded-lg
                                                    ${uploadingIndex === index
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                                    } text-white transition-colors duration-200`}
                                            >
                                                {uploadingIndex === index ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Enviando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload size={16} className="mr-2" />
                                                        Substituir imagem
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

};

export default ImageEditorModal;
