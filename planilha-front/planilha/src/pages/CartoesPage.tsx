import React from 'react';
import CartaoList from '../components/CartaoList';

const CartoesPage: React.FC = () => {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-center mb-6 dark:text-violet-600">
        Gerenciamento de Cartões
      </h1>
      <CartaoList />
    </div>
  );
};

export default CartoesPage;