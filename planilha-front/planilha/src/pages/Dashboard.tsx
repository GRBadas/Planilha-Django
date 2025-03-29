import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import GraficoCategorias from '../components/GraficoCategorias';

interface Cartao {
  id: number;
  nome: string;
  tipo: 'credito' | 'debito';
  saldo: number | null;
  limite: number | null;
}

interface Categoria {
  id: number;
  nome: string;
}

interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  tipo: 'entrada' | 'saida';
  cartao: number | null;
  categoria: number;
  cartao_nome?: string;
  categoria_nome?: string;
}

const formatarValor = (valor: number) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);
  const [showNovaTransacao, setShowNovaTransacao] = useState(false);

  // Busca transações paginadas
  const { data: transacoesData, isLoading } = useQuery({
    queryKey: ['transacoes', page],
    queryFn: () => api.get(`transacoes/?page=${page}`).then(res => ({
      transacoes: res.data.results,
      totalPages: Math.ceil(res.data.count / 8)
    }))
  });

  // Busca cartões
  const { data: cartoes } = useQuery({
    queryKey: ['cartoes'],
    queryFn: () => api.get('cartoes/').then(res => res.data)
  });

  // Busca categorias
  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => api.get('categorias/').then(res => res.data)
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`transacoes/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['cartoes'] });
    }
  });

  // Mutation para editar
  const updateMutation = useMutation({
    mutationFn: (transacao: Transacao) =>
      api.put(`transacoes/${transacao.id}/`, transacao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['cartoes'] });
      setEditingTransacao(null);
    }
  });

  // Mutation para criar nova transação
  const createMutation = useMutation({
    mutationFn: (novaTransacao: Omit<Transacao, 'id'>) => 
      api.post('transacoes/', novaTransacao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['cartoes'] });
      setShowNovaTransacao(false);
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransacao) {
      updateMutation.mutate(editingTransacao);
    }
  };

  const handleNovaTransacaoSubmit = (e: React.FormEvent, formData: any) => {
    e.preventDefault();
    const payload = {
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      data: formData.data,
      tipo: formData.tipo,
      cartao: formData.cartaoId ? Number(formData.cartaoId) : null,
      categoria: Number(formData.categoriaId)
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="w-full p-4 bg-neutral-950 min-h-screen">
      {/* Seção de Cartões com Scroll Horizontal */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-zinc-200">Seus Cartões</h2>
          {cartoes?.length > 3 && (
            <div className="flex space-x-2">
              <button
                className="p-1 text-zinc-400 hover:text-violet-400 transition-colors"
                onClick={() => {
                  const container = document.querySelector('.cards-container');
                  container?.scrollBy({ left: -300, behavior: 'smooth' });
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                className="p-1 text-zinc-400 hover:text-violet-400 transition-colors"
                onClick={() => {
                  const container = document.querySelector('.cards-container');
                  container?.scrollBy({ left: 300, behavior: 'smooth' });
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          {cartoes?.length > 3 && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-zinc-900 to-transparent pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-zinc-900 to-transparent pointer-events-none"></div>
            </>
          )}
          
          <div className={`cards-container overflow-x-auto scrollbar-hide pb-4 ${cartoes?.length > 3 ? 'px-8' : 'px-4'}`}>
            <div className="flex space-x-4 justify-center">
              {cartoes?.map((cartao: Cartao) => (
                <div 
                  key={cartao.id} 
                  className={`flex-shrink-0 w-72 p-4 rounded-lg shadow-lg transition-all hover:scale-[1.02] ${
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
                          {formatarValor(cartao.limite || 0)}
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
                          {formatarValor(cartao.saldo || 0)}
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botão Nova Transação */}
      <div className="flex justify-start mb-6">
        <button
          onClick={() => setShowNovaTransacao(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nova Transação
        </button>
      </div>

      {/* Lista de Transações com Paginação */}
      <div className="bg-zinc-900 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-zinc-200">
          Últimas Transações
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {transacoesData?.transacoes.length === 0 ? (
                <div className="text-center py-6 text-zinc-400">
                  Nenhuma transação encontrada
                </div>
              ) : (
                transacoesData?.transacoes.map((transacao: Transacao) => (
                  <div key={transacao.id} className="bg-zinc-700/50 hover:bg-zinc-700 p-4 rounded-lg transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-white">{transacao.descricao}</h3>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="text-xs text-zinc-400">
                            {new Date(transacao.data).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-zinc-600 rounded-full">
                            {transacao.categoria_nome}
                          </span>
                          {transacao.cartao_nome && (
                            <span className="text-xs px-2 py-0.5 bg-zinc-600 rounded-full">
                              {transacao.cartao_nome}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${
                          transacao.tipo === 'entrada' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {formatarValor(transacao.valor)}
                        </span>
                        <button
                          onClick={() => setEditingTransacao(transacao)}
                          className="p-1 text-amber-400 hover:text-amber-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(transacao.id)}
                          className="p-1 text-rose-400 hover:text-rose-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className='mt-20 w-full'>
          <GraficoCategorias></GraficoCategorias>
      </div>

            {/* Paginação */}
            {transacoesData?.totalPages && transacoesData.totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-zinc-700 rounded text-zinc-300 disabled:opacity-50 hover:bg-zinc-600 transition-colors"
                >
                  Anterior
                </button>
                <span className="text-zinc-300 text-sm">
                  Página {page} de {transacoesData?.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === transacoesData?.totalPages}
                  className="px-4 py-2 bg-zinc-700 rounded text-zinc-300 disabled:opacity-50 hover:bg-zinc-600 transition-colors"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Nova Transação */}
      {showNovaTransacao && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 p-6 rounded-lg w-full max-w-md border border-zinc-700 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-zinc-200">Nova Transação</h3>
              <button
                onClick={() => setShowNovaTransacao(false)}
                className="text-zinc-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <NovaTransacaoForm 
              cartoes={cartoes || []}
              categorias={categorias || []}
              onSubmit={handleNovaTransacaoSubmit}
              onCancel={() => setShowNovaTransacao(false)}
              isLoading={createMutation.isLoading}
            />
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {editingTransacao && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 p-6 rounded-lg w-full max-w-md border border-zinc-700 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-zinc-200">Editar Transação</h3>
              <button
                onClick={() => setEditingTransacao(null)}
                className="text-zinc-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={editingTransacao.descricao}
                    onChange={(e) => setEditingTransacao({
                      ...editingTransacao,
                      descricao: e.target.value
                    })}
                    className="w-full p-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={editingTransacao.valor}
                      onChange={(e) => setEditingTransacao({
                        ...editingTransacao,
                        valor: parseFloat(e.target.value) || 0
                      })}
                      className="w-full p-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Data</label>
                    <input
                      type="date"
                      value={editingTransacao.data}
                      onChange={(e) => setEditingTransacao({
                        ...editingTransacao,
                        data: e.target.value
                      })}
                      className="w-full p-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTransacao(null)}
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente do formulário de nova transação
const NovaTransacaoForm = ({ 
  cartoes, 
  categorias, 
  onSubmit, 
  onCancel,
  isLoading
}: {
  cartoes: Cartao[];
  categorias: Categoria[];
  onSubmit: (e: React.FormEvent, formData: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data: '',
    tipo: '',
    cartaoId: '',
    categoriaId: ''
  });
  const [erro, setErro] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'tipo' && formData.cartaoId) {
      const cartao = cartoes.find(c => c.id === Number(formData.cartaoId));
      if (cartao?.tipo === 'credito' && value === 'entrada') {
        setErro('Cartão de crédito não aceita entradas');
      } else {
        setErro('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    const valorNumerico = parseFloat(formData.valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro('Valor deve ser positivo');
      return;
    }

    if (!formData.data || !formData.tipo || !formData.categoriaId) {
      setErro('Preencha todos os campos obrigatórios');
      return;
    }

    onSubmit(e, formData);
  };

  const cartaoAtual = cartoes.find(c => c.id === Number(formData.cartaoId));

  return (
    <form onSubmit={handleSubmit}>
      {/* Mensagem de erro */}
      {erro && (
        <div className="mb-4 p-3 bg-rose-900/80 text-rose-100 rounded-lg border border-rose-700">
          {erro}
        </div>
      )}

      {/* Informações do cartão selecionado */}
      {formData.cartaoId && cartaoAtual && (
        <div className={`mb-4 p-3 rounded-lg ${cartaoAtual.tipo === 'credito' ? 'bg-violet-900/30' : 'bg-zinc-700/50'} border ${cartaoAtual.tipo === 'credito' ? 'border-violet-700' : 'border-zinc-600'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-white">{cartaoAtual.nome}</h4>
              <p className="text-xs text-zinc-400">
                {cartaoAtual.tipo === 'credito' ? 'CARTÃO DE CRÉDITO' : 'CARTÃO DE DÉBITO'}
              </p>
            </div>
            <p className={`text-sm ${cartaoAtual.tipo === 'credito' ? 'text-violet-300' : (cartaoAtual.saldo || 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {cartaoAtual.tipo === 'credito' 
                ? `Limite: ${formatarValor(cartaoAtual.limite || 0)}` 
                : `Saldo: ${formatarValor(cartaoAtual.saldo || 0)}`}
            </p>
          </div>
        </div>
      )}

      {/* Campos do formulário */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Descrição*</label>
          <input
            type="text"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 border border-zinc-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Valor (R$)*</label>
            <input
              type="number"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              className="w-full px-3 py-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 border border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Data*</label>
            <input
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 border border-zinc-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Cartão</label>
          <select
            name="cartaoId"
            value={formData.cartaoId}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 border border-zinc-600"
          >
            <option value="">Nenhum (opcional)</option>
            {cartoes.map(cartao => (
              <option key={cartao.id} value={cartao.id}>
                {cartao.nome} ({cartao.tipo === 'credito' ? 'Crédito' : 'Débito'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Tipo*</label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 border border-zinc-600"
          >
            <option value="">Selecione...</option>
            <option value="saida">Saída/Pagamento</option>
            {(!formData.cartaoId || cartaoAtual?.tipo === 'debito') && (
              <option value="entrada">Entrada</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Categoria*</label>
          <select
            name="categoriaId"
            value={formData.categoriaId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 border border-zinc-600"
          >
            <option value="">Selecione...</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};

export default Dashboard;