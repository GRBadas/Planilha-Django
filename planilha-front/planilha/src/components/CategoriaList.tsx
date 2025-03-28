import { useEffect, useState } from 'react';
import api from '../services/api';

interface Categoria {
  id: number;
  nome: string;
}

const CategoriaList = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nome, setNome] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Busca categorias
  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await api.get('categorias/');
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  // Manipuladores do CRUD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`categorias/${editingId}/`, { nome });
      } else {
        await api.post('categorias/', { nome });
      }
      resetForm();
      fetchCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setNome(categoria.nome);
    setEditingId(categoria.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await api.delete(`categorias/${id}/`);
        fetchCategorias();
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
      }
    }
  };

  const resetForm = () => {
    setNome('');
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className='p-10'>
      <div className="max-w-4xl mx-auto p-6 bg-zinc-700 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-center text-gray-300">Categorias</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showForm ? 'Cancelar' : 'Nova Categoria'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-zinc-600 rounded-lg">
            <div className="mb-4">
              <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-2">
                Nome da Categoria
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-500 text-white rounded"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {categorias.map((categoria) => (
            <div
              key={categoria.id}
              className="p-4 bg-zinc-600 rounded-lg shadow-sm flex justify-between items-center"
            >
              <span className="text-lg font-semibold text-white">{categoria.nome}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(categoria)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(categoria.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriaList;