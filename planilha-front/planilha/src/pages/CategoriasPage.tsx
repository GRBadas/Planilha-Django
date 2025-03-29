import React from 'react';
import CategoriaList from '../components/CategoriaList';

const CategoriasPage: React.FC = () => {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-center mb-6 dark:text-violet-600">
        Gerenciamento de Categorias
      </h1>
      <CategoriaList />
    </div>
  );
};

export default CategoriasPage;