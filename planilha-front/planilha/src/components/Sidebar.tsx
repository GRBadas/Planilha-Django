import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-zinc-900 border-b border-zinc-800">
      <div className="container flex justify-between items-center h-16 mx-auto px-4">
        {/* Logo */}
        <Link 
          to="/"
          aria-label="Back to homepage" 
          className="flex items-center p-2 group"
        >
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-600">
              FinanceApp
            </span>
          </div>
        </Link>

        {/* Links de navegação */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/') 
                ? 'bg-zinc-800 text-violet-400' 
                : 'text-zinc-400 hover:text-violet-300 hover:bg-zinc-800/50'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/cartoes"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/cartoes') 
                ? 'bg-zinc-800 text-violet-400' 
                : 'text-zinc-400 hover:text-violet-300 hover:bg-zinc-800/50'
            }`}
          >
            Cartões
          </Link>
          <Link
            to="/categorias"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/categorias') 
                ? 'bg-zinc-800 text-violet-400' 
                : 'text-zinc-400 hover:text-violet-300 hover:bg-zinc-800/50'
            }`}
          >
            Categorias
          </Link>
          <Link
            to="/transacoes"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/transacoes') 
                ? 'bg-zinc-800 text-violet-400' 
                : 'text-zinc-400 hover:text-violet-300 hover:bg-zinc-800/50'
            }`}
          >
            Transações
          </Link>
        </nav>

        {/* Botão mobile */}
        <button className="md:hidden p-2 rounded-md text-zinc-400 hover:text-violet-400 hover:bg-zinc-800 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Sidebar;