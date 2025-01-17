// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import {
    Settings,
    Users,
    FileText,
    Link,
    Home,
    MessageSquare,
    HelpCircle,
    Globe,
    Database,
    Filter,
    ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '@/components/ProfileModal'; // Assegure-se de que o caminho esteja correto

const Header = () => {
    const [darkMode, setDarkMode] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Dados do usuário
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();

    const navigate = useNavigate();

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        setDarkMode(theme === 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, []);

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
    };

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="flex justify-between items-center p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4">
                <button
                    onClick={() => navigate('/pages')}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    Páginas
                </button>
                <button onClick={() => navigate('/domains')} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                    Domínios
                </button>
                <button onClick={() => navigate('/integrations')} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                    Integração
                </button>
                <button onClick={() => navigate('/leads')} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                    Leads
                </button>
            </div>

            <div className="relative dropdown-container">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-3 focus:outline-none"
                >
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        {userData.firstName ? userData.firstName[0].toUpperCase() : 'U'}
                    </div>
                    <div className="text-left hidden md:block">
                        <div className="text-gray-700 dark:text-white font-medium">
                            {fullName || 'Usuário'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {userData.email || 'email@example.com'}
                        </div>
                    </div>
                    <ChevronDown size={20} className="hidden md:block text-gray-500 dark:text-gray-400" />
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="font-semibold text-gray-900 dark:text-white">
                                {fullName || 'Usuário'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {userData.email || 'email@example.com'}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setIsDropdownOpen(false);
                                setIsProfileModalOpen(true);
                            }}
                            className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                            Meus dados
                        </button>

                        <button
                            onClick={handleThemeChange}
                            className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                            {darkMode ? 'Modo claro' : 'Modo escuro'}
                        </button>

                        <button
                            disabled
                            className="block w-full text-left px-4 py-2 text-gray-400 dark:text-gray-500 hover:cursor-not-allowed"
                        >
                            Financeiro
                        </button>

                        <button
                            disabled
                            className="block w-full text-left px-4 py-2 text-gray-400 dark:text-gray-500 hover:cursor-not-allowed"
                        >
                            Meu plano
                        </button>

                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                            Sair da conta
                        </button>
                    </div>
                )}
            </div>

            {/* Modais */}
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </div>
    );
};

export default Header;
