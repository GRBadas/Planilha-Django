import React from 'react';
import CartaoList from './components/CartaoList';
import CategoriaList from './components/CategoriaList';
import TransacaoList from './components/TransacaoList';
import NovaTransacao from './components/NovaTransação';

const App: React.FC = () => {
  return (
    <div className='flex bg-zinc-800 flex-col items-center'>
      <h1 className='text-3xl font-semibold text-center text-gray-300'>Gestão de Gastos</h1>
      <div className='mt-30 flex'>
        <NovaTransacao />
        <CartaoList />
        <CategoriaList />
        <TransacaoList />
      </div>
    </div>
  );
};

export default App;
