import React from 'react';
import CartaoList from './components/CartaoList';
import CategoriaList from './components/CategoriaList';
import TransacaoList from './components/TransacaoList';
import NovaTransacao from './components/NovaTransação';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  return (
    <div>
      <Sidebar />
    <div className="flex">
      <div className="flex-1 bg-zinc-800 flex flex-col items-center p-4">
        <h1 className="text-3xl font-semibold text-center dark:text-violet-600">Gestão de Gastos</h1>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <NovaTransacao />
          <CartaoList />
          <CategoriaList />
          <TransacaoList />
        </div>
      </div>
    </div>
    </div>
  );
};

export default App;
