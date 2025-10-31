import React, { useState, useRef, useEffect } from 'react';
import { User, HeaderStyle, Page } from '../types';
import Icon from './common/Icon';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onToggleTheme: () => void;
  currentTheme: 'light' | 'dark';
  onToggleSidebar: () => void;
  companyName: string;
  headerStyle: HeaderStyle;
  setActivePage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onToggleTheme, currentTheme, onToggleSidebar, companyName, headerStyle, setActivePage }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-white dark:bg-dark-card shadow-md flex items-center justify-between px-4 sm:px-6 z-10 flex-shrink-0">
      <div className="flex items-center min-w-0 flex-grow">
        <button onClick={onToggleSidebar} className="text-gray-500 dark:text-dark-text-secondary focus:outline-none lg:hidden mr-4">
            <Icon name="Menu" size={24} />
        </button>
        <h2 
            className="font-bold text-brand-secondary dark:text-dark-text-primary truncate tracking-wide w-full"
            style={{
                fontFamily: headerStyle.fontFamily,
                fontSize: headerStyle.fontSize,
                textAlign: headerStyle.textAlign,
            }}
        >
            {companyName}
        </h2>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <button onClick={onToggleTheme} className="text-gray-600 dark:text-yellow-400 hover:text-brand-primary dark:hover:text-yellow-300 transition-colors p-2 rounded-full" title="Alternar tema">
            {currentTheme === 'light' ? <Icon name="Moon" size={22} /> : <Icon name="Sun" size={22} />}
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-dark-bg">
            <div className="text-right mr-2 hidden sm:block">
              <p className="font-semibold text-brand-secondary dark:text-dark-text-primary">{user.realName}</p>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{user.role}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {user.realName.charAt(0)}
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-md shadow-lg py-1 z-20 border dark:border-dark-border animate-scale-in">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage('Meu Perfil');
                  setIsDropdownOpen(false);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg"
              >
                <Icon name="User" size={16} className="mr-2" /> Meu Perfil
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onLogout();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg"
              >
                 <Icon name="LogOut" size={16} className="mr-2" /> Sair
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;