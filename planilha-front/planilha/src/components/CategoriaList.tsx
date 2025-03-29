import { useEffect, useState } from 'react';
import api from '../services/api';
import GraficoCategorias from './GraficoCategorias';

interface Categoria {
  id: number;
  nome: string;
}

// Array de cores em gradiente para as categorias
const categoryColors = [
  'from-purple-500 to-purple-700',
  'from-blue-500 to-blue-700',
  'from-green-500 to-green-700',
  'from-yellow-500 to-yellow-700',
  'from-red-500 to-red-700',
  'from-pink-500 to-pink-700',
  'from-indigo-500 to-indigo-700',
  'from-teal-500 to-teal-700',
  'from-orange-500 to-orange-700',
  'from-cyan-500 to-cyan-700'
];

const CategoriaList = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nome, setNome] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

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

  // Função para obter cor baseada no ID da categoria
  const getCategoryColor = (id: number) => {
    return categoryColors[id % categoryColors.length];
  };

  return (
    <div className="w-full p-4 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-zinc-200">Categorias</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
          >
            {showForm ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nova Categoria
              </>
            )}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-zinc-800 rounded-lg border border-zinc-700">
            <h3 className="text-lg font-semibold mb-4 text-zinc-200">
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-300 mb-1">Nome*</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 border border-zinc-600"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-500 transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map((categoria) => (
            <div
              key={categoria.id}
              className={`bg-gradient-to-br ${getCategoryColor(categoria.id)} p-4 rounded-lg shadow-lg transition-all hover:scale-[1.02]`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{categoria.nome}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(categoria)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                    title="Editar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(categoria.id)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                    title="Excluir"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='mt-20 w-4/5 ml-50'>
          <GraficoCategorias></GraficoCategorias>
      </div>
    </div>
  );
};

export default CategoriaList;