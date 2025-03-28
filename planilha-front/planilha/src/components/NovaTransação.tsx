import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Cartao {
  id: number;
  nome: string;
  tipo: 'credito' | 'debito';
  saldo?: number | string | null;  // Mais flexível
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
        data: formData.data, // Já está no formato YYYY-MM-DD
        tipo: formData.tipo,
        cartao: Number(formData.cartaoId), // Campo deve ser 'cartao' (singular)
        categoria: Number(formData.categoriaId) // Campo deve ser 'categoria' (singular)
      };
  
      console.log('Enviando payload:', payload); // Para debug
  
      const response = await api.post('transacoes/', payload);
      
      // Atualiza a lista de cartões
      const updatedCartoes = await api.get('cartoes/');
      setCartoes(updatedCartoes.data);
  
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
    <div className="p-10">
      <div className="max-w-4xl mx-auto p-10 bg-zinc-700 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-300">
          Adicionar Nova Transação
        </h2>

        {/* Informações do cartão selecionado */}
        {cartaoAtual && (
          <div className="mb-6 p-4 bg-zinc-600 rounded-lg">
            <h3 className="font-bold text-lg text-white">
              {cartaoAtual.nome} ({cartaoAtual.tipo === 'credito' ? 'Crédito' : 'Débito'})
            </h3>
            {cartaoAtual?.tipo === 'credito' ? (
              <p className="text-gray-300">
                Limite disponível: R$ {formatarValor(cartaoAtual.limite)}
              </p>
            ) : (
              <p className="text-gray-300">
                Saldo atual: R$ {formatarValor(cartaoAtual?.saldo)}
              </p>
            )}
          </div>
        )}

        {/* Mensagem de erro */}
        {erro && (
          <div className="mb-4 p-3 bg-red-500 text-white rounded">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo Descrição */}
          <div className="mb-4">
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-300 mb-1">
              Descrição
            </label>
            <input
              type="text"
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-zinc-600 border border-zinc-500 rounded-md text-white focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Campo Valor */}
          <div className="mb-4">
            <label htmlFor="valor" className="block text-sm font-medium text-gray-300 mb-1">
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
              className="w-full px-4 py-2 bg-zinc-600 border border-zinc-500 rounded-md text-white focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Campo Data */}
          <div className="mb-4">
            <label htmlFor="data" className="block text-sm font-medium text-gray-300 mb-1">
              Data
            </label>
            <input
              type="date"
              id="data"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-zinc-600 border border-zinc-500 rounded-md text-white focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Campo Cartão */}
          <div className="mb-4">
            <label htmlFor="cartaoId" className="block text-sm font-medium text-gray-300 mb-1">
              Cartão
            </label>
            <select
              id="cartaoId"
              name="cartaoId"
              value={formData.cartaoId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-zinc-600 border border-zinc-500 rounded-md text-white focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Selecione...</option>
              {cartoes.map(cartao => (
                <option key={cartao.id} value={cartao.id}>
                  {cartao.nome} ({cartao.tipo === 'credito' ? 'Crédito' : 'Débito'})
                </option>
              ))}
            </select>
          </div>

           {/* Campo Tipo */}
           <div className="mb-4">
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-300 mb-1">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-zinc-600 border border-zinc-500 rounded-md text-white"
            >
              <option value="">Selecione...</option>
              <option value="saida">Saída/Pagamento</option>
              {cartaoAtual?.tipo === 'debito' && (
                <option value="entrada">Entrada</option>
              )}
            </select>
          </div>

          {/* Campo Categoria */}
          <div className="mb-6">
            <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-300 mb-1">
              Categoria
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-zinc-600 border border-zinc-500 rounded-md text-white focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Selecione...</option>
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
            className={`w-full py-3 px-4 rounded-md font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 ${loading ? 'bg-zinc-500 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'
              }`}
          >
            {loading ? 'Processando...' : 'Adicionar Transação'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NovaTransacao;