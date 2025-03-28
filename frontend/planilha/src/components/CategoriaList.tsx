import { useEffect, useState } from 'react';
import api from '../services/api';

interface Categoria {
  id: number;
  nome: string;
}

const CategoriaList = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await api.get('categorias/');
        setCategorias(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchCategorias();
  }, []);

  return (
    <div className='p-10'>
    <div className="max-w-4xl mx-auto p-6 bg-zinc-700 rounded-lg shadow-md">
      <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">Categorias</h2>
      <div className="space-y-4">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className="p-4 bg-gray-50 rounded-lg shadow-sm"
          >
            <span className="text-lg font-semibold text-gray-800">{categoria.nome}</span>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default CategoriaList;
