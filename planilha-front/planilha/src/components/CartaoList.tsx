import { useEffect, useState } from 'react';
import api from '../services/api';

interface Cartao {
  id: number;
  nome: string;
  tipo: string;
  limite: string;
  saldo: string;
}

const CartaoList = () => {
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [cartaoEditando, setCartaoEditando] = useState<Cartao | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'credito',
    limite: '',
    saldo: ''
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    fetchCartoes();
  }, []);

  const fetchCartoes = async () => {
    try {
      const response = await api.get('cartoes/');
      setCartoes(response.data);
    } catch (error) {
      console.error('Erro ao buscar cartões:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (cartaoEditando) {
        await api.put(`cartoes/${cartaoEditando.id}/`, formData);
      } else {
        await api.post('cartoes/', formData);
      }
      resetForm();
      fetchCartoes();
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
    }
  };

  // Preenche o formulário para edição
  const handleEditar = (cartao: Cartao) => {
    setCartaoEditando(cartao);
    setFormData({
      nome: cartao.nome,
      tipo: cartao.tipo,
      limite: cartao.limite,
      saldo: cartao.saldo
    });
    setMostrarFormulario(true);
  };

  // Remove um cartão
  const handleDeletar = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cartão?')) {
      try {
        await api.delete(`cartoes/${id}/`);
        fetchCartoes();
      } catch (error) {
        console.error('Erro ao excluir cartão:', error);
      }
    }
  };

  // Reseta o formulário
  const resetForm = () => {
    setFormData({ nome: '', tipo: 'credito', limite: '', saldo: '' });
    setCartaoEditando(null);
    setMostrarFormulario(false);
  };

  return (
    <div className='p-10'>
      <div className="max-w-4xl mx-auto p-6 bg-zinc-700 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-center text-gray-800">Cartões</h2>
          <button
            onClick={() => !mostrarFormulario ? setMostrarFormulario(true) : resetForm()}
            className={`px-4 py-2 rounded ${mostrarFormulario ? 'bg-zinc-400 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'} text-zinc-400`}
          >
            {mostrarFormulario ? 'Cancelar' : 'Adicionar Cartão'}
          </button>
        </div>

        {mostrarFormulario && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-zinc-400 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-zinc-700">
              {cartaoEditando ? 'Editar Cartão' : 'Novo Cartão'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-bold">Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold">Tipo</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option className='bg-zinc-800' value="credito">Crédito</option>
                  <option className='bg-zinc-700' value="debito">Débito</option>
                </select>
              </div>
              {formData.tipo === 'credito' && (
                <div>
                  <label className="block text-gray-700 font-bold">Limite (R$)</label>
                  <input
                    type="number"
                    name="limite"
                    value={formData.limite}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    step="0.01"
                    required
                  />
                </div>
              )}
              {formData.tipo === 'debito' && (
                <div>
                  <label className="block text-gray-700">Saldo Inicial (R$)</label>
                  <input
                    type="number"
                    name="saldo"
                    value={formData.saldo}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    step="0.01"
                    required
                  />
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
              >
                {cartaoEditando ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {cartoes.map((cartao) => (
            <div
              key={cartao.id}
              className="p-4 bg-zinc-400 rounded-lg shadow-sm flex justify-between items-center"
            >
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-800">{cartao.nome}</span>
                <span className="text-sm text-gray-600 capitalize">{cartao.tipo}</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {cartao.tipo === 'credito' ? `Limite: R$ ${cartao.limite}` : `Saldo: R$ ${cartao.saldo}`}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditar(cartao)}
                  className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeletar(cartao.id)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
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

export default CartaoList;