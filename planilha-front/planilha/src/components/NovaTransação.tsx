import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Cartao {
  id: number;
  nome: string;
  tipo: 'credito' | 'debito';
  saldo?: number | string | null;
  limite?: number | string | null;
}

interface Categoria {
  id: number;
  nome: string;
}

const formatarValor = (valor?: number | string | null) => {
  if (valor === null || valor === undefined) return '0.00';

  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  return isNaN(numero) ? '0.00' : numero.toFixed(2);
};

const NovaTransacao: React.FC = () => {
  // Estados do formulário
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data: '',
    tipo: '',
    cartaoId: '',
    categoriaId: ''
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // Busca dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartoesRes, categoriasRes] = await Promise.all([
          api.get('cartoes/'),
          api.get('categorias/')
        ]);
        setCartoes(cartoesRes.data);
        setCategorias(categoriasRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setErro('Falha ao carregar dados iniciais');
      }
    };

    fetchData();
  }, []);

  // Manipula mudanças nos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validação especial para cartão de crédito
    if (name === 'tipo' && formData.cartaoId) {
      const cartao = cartoes.find(c => c.id === Number(formData.cartaoId));
      if (cartao?.tipo === 'credito' && value === 'entrada') {
        setErro('Cartão de crédito não aceita entradas');
      } else {
        setErro('');
      }
    }
  };

  // Envio do formulário
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErro('');
  
    try {
      // Validações
      const valorNumerico = parseFloat(formData.valor);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        throw new Error('Valor deve ser positivo');
      }
  
      if (!formData.data || !formData.tipo || !formData.cartaoId || !formData.categoriaId) {
        throw new Error('Preencha todos os campos');
      }
  
      // Formatando os dados para o backend
      const payload = {
        descricao: formData.descricao,
        valor: valorNumerico,
        data: formData.data,
        tipo: formData.tipo,
        cartao: Number(formData.cartaoId),
        categoria: Number(formData.categoriaId)
      };
  
      const response = await api.post('transacoes/', payload);
      
      // Atualiza a lista de cartões
      const updatedCartoes = await api.get('cartoes/');
      setCartoes(updatedCartoes.data);
  
      // Limpa o formulário após sucesso
      setFormData({
        descricao: '',
        valor: '',
        data: '',
        tipo: '',
        cartaoId: '',
        categoriaId: ''
      });
      
      alert('Transação registrada com sucesso!');
    } catch (error: any) {
      console.error('Erro completo:', error.response?.data || error);
      setErro(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message ||
        'Erro ao registrar transação'
      );
    } finally {
      setLoading(false);
    }
  };

  // Cartão selecionado (para mostrar informações)
  const cartaoAtual = cartoes.find(c => c.id === Number(formData.cartaoId));

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto p-6 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700">
        <h2 className="text-2xl font-semibold text-center mb-6 text-violet-400">
          Nova Transação
        </h2>

        {/* Informações do cartão selecionado */}
        {cartaoAtual && (
          <div className={`mb-6 p-4 rounded-lg ${cartaoAtual.tipo === 'credito' ? 'bg-violet-900/30' : 'bg-zinc-700/50'} border ${cartaoAtual.tipo === 'credito' ? 'border-violet-700' : 'border-zinc-600'}`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white">{cartaoAtual.nome}</h3>
                <p className="text-xs text-zinc-400">
                  {cartaoAtual.tipo === 'credito' ? 'CARTÃO DE CRÉDITO' : 'CARTÃO DE DÉBITO'}
                </p>
              </div>
              <div className={`p-2 rounded-full ${cartaoAtual.tipo === 'credito' ? 'bg-violet-600/20' : 'bg-emerald-600/20'}`}>
                {cartaoAtual.tipo === 'credito' ? (
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
            {cartaoAtual?.tipo === 'credito' ? (
              <p className="text-sm text-violet-300 mt-2">
                Limite disponível: {formatarValor(cartaoAtual.limite)}
              </p>
            ) : (
              <p className={`text-sm ${(cartaoAtual.saldo || 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'} mt-2`}>
                Saldo disponível: {formatarValor(cartaoAtual?.saldo)}
              </p>
            )}
          </div>
        )}

        {/* Mensagem de erro */}
        {erro && (
          <div className="mb-4 p-3 bg-rose-900/80 text-rose-100 rounded-lg border border-rose-700">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo Descrição */}
          <div className="mb-4">
            <label htmlFor="descricao" className="block text-sm font-medium text-zinc-300 mb-2">
              Descrição
            </label>
            <input
              type="text"
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent border border-zinc-600"
              placeholder="Ex: Supermercado, Salário..."
            />
          </div>

          {/* Campo Valor */}
          <div className="mb-4">
            <label htmlFor="valor" className="block text-sm font-medium text-zinc-300 mb-2">
              Valor (R$)
            </label>
            <input
              type="number"
              id="valor"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              className="w-full px-4 py-2 bg-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent border border-zinc-600"
              placeholder="0,00"
            />
          </div>

          {/* Campo Data */}
          <div className="mb-4">
            <label htmlFor="data" className="block text-sm font-medium text-zinc-300 mb-2">
              Data
            </label>
            <input
              type="date"
              id="data"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent border border-zinc-600"
            />
          </div>

          {/* Campo Cartão */}
          <div className="mb-4">
            <label htmlFor="cartaoId" className="block text-sm font-medium text-zinc-300 mb-2">
              Cartão
            </label>
            <select
              id="cartaoId"
              name="cartaoId"
              value={formData.cartaoId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent border border-zinc-600"
            >
              <option value="">Selecione um cartão...</option>
              {cartoes.map(cartao => (
                <option key={cartao.id} value={cartao.id}>
                  {cartao.nome} ({cartao.tipo === 'credito' ? 'Crédito' : 'Débito'})
                </option>
              ))}
            </select>
          </div>

          {/* Campo Tipo */}
          <div className="mb-4">
            <label htmlFor="tipo" className="block text-sm font-medium text-zinc-300 mb-2">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent border border-zinc-600"
            >
              <option value="">Selecione o tipo...</option>
              <option value="saida">Saída/Pagamento</option>
              {cartaoAtual?.tipo === 'debito' && (
                <option value="entrada">Entrada</option>
              )}
            </select>
          </div>

          {/* Campo Categoria */}
          <div className="mb-6">
            <label htmlFor="categoriaId" className="block text-sm font-medium text-zinc-300 mb-2">
              Categoria
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent border border-zinc-600"
            >
              <option value="">Selecione uma categoria...</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Botão de submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-800 ${
              loading ? 'bg-zinc-600 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-500'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adicionar Transação
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NovaTransacao;