import React, { useState, useEffect } from 'react';

const ImageComponent = ({ src, alt, className }) => {
    const [key, setKey] = useState(0);
    const [imageSrc, setImageSrc] = useState('');

    useEffect(() => {
        // Garantir que o src comece com / se for um caminho local
        const normalizedSrc = src.startsWith('http') ? src : src.startsWith('/') ? src : `/${src}`;
        const timestamp = new Date().getTime();
        setImageSrc(`${normalizedSrc}?t=${timestamp}`);
        setKey(prev => prev + 1);
    }, [src]);

    const handleError = (e) => {
        console.error('Erro ao carregar imagem:', imageSrc);
        // Tentar recarregar a imagem em caso de erro
        setTimeout(() => {
            const newTimestamp = new Date().getTime();
            setImageSrc(`${src}?t=${newTimestamp}`);
            setKey(prev => prev + 1);
        }, 1000);
    };

    return (
        <img
            key={key}
            src={imageSrc}
            alt={alt}
            className={className}
            onError={handleError}
        />
    );
};

export default ImageComponent;