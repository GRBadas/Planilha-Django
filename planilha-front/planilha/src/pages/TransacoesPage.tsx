import React from 'react';
import TransacaoList from '../components/TransacaoList';

const TransacoesPage: React.FC = () => {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-center mb-6 dark:text-violet-600">
        Histórico de Transações
      </h1>
      <TransacaoList />
    </div>
  );
};

export default TransacoesPage;