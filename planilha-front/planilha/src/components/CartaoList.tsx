import { useEffect, useState } from 'react';
import api from '../services/api';

interface Cartao {
  id: number;
  nome: string;
  tipo: 'credito' | 'debito';
  limite: number | null;
  saldo: number | null;
}

const CartaoList = () => {
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [cartaoEditando, setCartaoEditando] = useState<Cartao | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'credito' as 'credito' | 'debito',
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
      const payload = {
        nome: formData.nome,
        tipo: formData.tipo,
        limite: formData.tipo === 'credito' ? Number(formData.limite) : null,
        saldo: formData.tipo === 'debito' ? Number(formData.saldo) : null
      };

      if (cartaoEditando) {
        await api.put(`cartoes/${cartaoEditando.id}/`, payload);
      } else {
        await api.post('cartoes/', payload);
      }
      resetForm();
      fetchCartoes();
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
    }
  };

  const handleEditar = (cartao: Cartao) => {
    setCartaoEditando(cartao);
    setFormData({
      nome: cartao.nome,
      tipo: cartao.tipo,
      limite: cartao.limite?.toString() || '',
      saldo: cartao.saldo?.toString() || ''
    });
    setMostrarFormulario(true);
  };

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

  const resetForm = () => {
    setFormData({ nome: '', tipo: 'credito', limite: '', saldo: '' });
    setCartaoEditando(null);
    setMostrarFormulario(false);
  };

  const formatarValor = (valor: number | null) => {
    if (valor === null) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="w-full p-4 bg-neutral-950 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-zinc-200">Seus Cartões</h2>
          <button
            onClick={() => !mostrarFormulario ? setMostrarFormulario(true) : resetForm()}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
          >
            {mostrarFormulario ? (
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
                Adicionar Cartão
              </>
            )}
          </button>
        </div>

        {mostrarFormulario && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-zinc-800 rounded-lg border border-zinc-700">
            <h3 className="text-lg font-semibold mb-4 text-zinc-200">
              {cartaoEditando ? 'Editar Cartão' : 'Novo Cartão'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nome*</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 border border-zinc-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Tipo*</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 border border-zinc-600"
                >
                  <option value="credito">Crédito</option>
                  <option value="debito">Débito</option>
                </select>
              </div>
              {formData.tipo === 'credito' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Limite (R$)*</label>
                  <input
                    type="number"
                    name="limite"
                    value={formData.limite}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 border border-zinc-600"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              )}
              {formData.tipo === 'debito' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Saldo Inicial (R$)*</label>
                  <input
                    type="number"
                    name="saldo"
                    value={formData.saldo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 border border-zinc-600"
                    step="0.01"
                    required
                  />
                </div>
              )}
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
                {cartaoEditando ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cartoes.map((cartao) => (
            <div 
              key={cartao.id} 
              className={`flex-shrink-0 p-4 rounded-lg shadow-lg transition-all hover:scale-[1.02] ${
                cartao.tipo === 'credito' 
                  ? 'bg-gradient-to-br from-violet-950 to-violet-800' 
                  : 'bg-gradient-to-br from-stone-900 to-stone-950'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-zinc-300 mb-1">
                    {cartao.tipo === 'credito' ? 'CARTÃO DE CRÉDITO' : 'CARTÃO DE DÉBITO'}
                  </p>
                  <h3 className="font-bold text-white">{cartao.nome}</h3>
                </div>
                <div className={`p-2 rounded-full ${
                  cartao.tipo === 'credito' ? 'bg-violet-600/20' : 'bg-emerald-600/20'
                }`}>
                  {cartao.tipo === 'credito' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-300" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                {cartao.tipo === 'credito' ? (
                  <>
                    <p className="text-xs text-violet-300 mb-1">LIMITE DISPONÍVEL</p>
                    <p className="text-xl font-bold text-white">
                      {formatarValor(cartao.limite)}
                    </p>
                    <div className="mt-2 h-1.5 bg-violet-900/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-400 rounded-full" 
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-emerald-300 mb-1">SALDO DISPONÍVEL</p>
                    <p className={`text-xl font-bold ${
                      (cartao.saldo || 0) >= 0 ? 'text-white' : 'text-rose-400'
                    }`}>
                      {formatarValor(cartao.saldo)}
                    </p>
                    <div className="mt-2 h-1.5 bg-emerald-900/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          (cartao.saldo || 0) >= 0 ? 'bg-emerald-400' : 'bg-rose-400'
                        }`} 
                        style={{ width: `${Math.min(100, Math.abs((cartao.saldo || 0) / 5000 * 100))}%` }}
                      ></div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => handleEditar(cartao)}
                  className="px-3 py-1 text-sm bg-zinc-700/50 hover:bg-zinc-700 text-amber-400 rounded transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeletar(cartao.id)}
                  className="px-3 py-1 text-sm bg-zinc-700/50 hover:bg-zinc-700 text-rose-400 rounded transition-colors"
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