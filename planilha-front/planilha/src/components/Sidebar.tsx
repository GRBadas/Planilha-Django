import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="p-4 dark:bg-zinc-700">
      <div className="container flex justify-between h-16 mx-auto">
        <Link 
          to="/"
          aria-label="Back to homepage" 
          className="flex items-center p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 32 32" className="w-8 h-8 dark:text-violet-600">
            {/* Seu SVG aqui */}
          </svg>
        </Link>
        <ul className="items-stretch hidden space-x-3 md:flex">
          <li className="flex">
            <Link
              to="/"
              className={`flex items-center px-4 -mb-1 border-b-2 ${isActive('/') ? 'dark:text-violet-600 dark:border-violet-600' : 'dark:border-transparent'}`}
            >
              Dashboard
            </Link>
          </li>
          <li className="flex">
            <Link
              to="/cartoes"
              className={`flex items-center px-4 -mb-1 border-b-2 ${isActive('/cartoes') ? 'dark:text-violet-600 dark:border-violet-600' : 'dark:border-transparent'}`}
            >
              Cartões
            </Link>
          </li>
          <li className="flex">
            <Link
              to="/categorias"
              className={`flex items-center px-4 -mb-1 border-b-2 ${isActive('/categorias') ? 'dark:text-violet-600 dark:border-violet-600' : 'dark:border-transparent'}`}
            >
              Categorias
            </Link>
          </li>
          <li className="flex">
            <Link
              to="/transacoes"
              className={`flex items-center px-4 -mb-1 border-b-2 ${isActive('/transacoes') ? 'dark:text-violet-600 dark:border-violet-600' : 'dark:border-transparent'}`}
            >
              Transações
            </Link>
          </li>
        </ul>
        <button className="flex justify-end p-4 md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Sidebar;