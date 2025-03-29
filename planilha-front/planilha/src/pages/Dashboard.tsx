import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import NovaTransacao from '../components/NovaTransação';

interface Cartao {
  id: number;
  nome: string;
  tipo: 'credito' | 'debito';
  saldo: number | null;
  limite: number | null;
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

  return (
    <div className="w-full p-4">
      <h1 className="text-3xl font-semibold text-center mb-6 dark:text-violet-600">
        Painel Principal
      </h1>

      {/* Seção de Cartões */}
      {/* Seção de Cartões com Scroll Horizontal */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Seus Cartões</h2>
          <div className="flex space-x-2">
            <button
              className="p-1 text-zinc-400 hover:text-white transition-colors"
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
              className="p-1 text-zinc-400 hover:text-white transition-colors"
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
        </div>

        <div className="relative">
          {/* Gradiente esquerdo */}
          <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-zinc-900 to-transparent pointer-events-none"></div>

          {/* Container do scroll */}
          <div className="cards-container overflow-x-auto scrollbar-hide pb-4">
            <div className="flex space-x-4" style={{ minWidth: `${cartoes?.length * 320}px` }}>
              {cartoes?.map((cartao: Cartao) => (
                <div
                  key={cartao.id}
                  className={`flex-shrink-0 w-80 p-5 rounded-xl shadow-lg transition-all hover:scale-105 ${cartao.tipo === 'credito' ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-green-900 to-green-800'
                    }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xs text-zinc-300 mb-1">Cartão {cartao.tipo === 'credito' ? 'de Crédito' : 'de Débito'}</p>
                      <h3 className="font-bold text-white text-lg">{cartao.nome}</h3>
                    </div>
                    <div className={`p-2 rounded-full ${cartao.tipo === 'credito' ? 'bg-blue-500/20' : 'bg-green-500/20'
                      }`}>
                      {cartao.tipo === 'credito' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    {cartao.tipo === 'credito' ? (
                      <>
                        <p className="text-xs text-blue-300 mb-1">Limite disponível</p>
                        <p className="text-2xl font-bold text-white">
                          {formatarValor(cartao.limite || 0)}
                        </p>
                        <div className="mt-3 h-2 bg-blue-900/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-400 rounded-full"
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-green-300 mb-1">Saldo disponível</p>
                        <p className={`text-2xl font-bold ${(cartao.saldo || 0) >= 0 ? 'text-white' : 'text-red-300'
                          }`}>
                          {formatarValor(cartao.saldo || 0)}
                        </p>
                        <div className="mt-3 h-2 bg-green-900/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${(cartao.saldo || 0) >= 0 ? 'bg-green-400' : 'bg-red-400'
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

          {/* Gradiente direito */}
          <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-zinc-900 to-transparent pointer-events-none"></div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Formulário de Nova Transação */}
        <div className="lg:w-1/3">
          <NovaTransacao />
        </div>

        {/* Lista de Transações com Paginação */}
        <div className="lg:w-2/3">
          <div className="bg-zinc-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Últimas Transações
            </h2>

            {isLoading ? (
              <div className="text-white">Carregando...</div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {transacoesData?.transacoes.map((transacao: Transacao) => (
                    <div key={transacao.id} className="bg-zinc-600 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-white">{transacao.descricao}</h3>
                          <p className="text-sm text-zinc-300">
                            {transacao.cartao_nome || 'Sem cartão'} • {transacao.categoria_nome}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`${transacao.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'}`}>
                            {formatarValor(transacao.valor)}
                          </span>
                          <button
                            onClick={() => setEditingTransacao(transacao)}
                            className="p-1 text-yellow-400 hover:text-yellow-300"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(transacao.id)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-zinc-600 rounded disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-white">
                    Página {page} de {transacoesData?.totalPages || 1}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === transacoesData?.totalPages}
                    className="px-4 py-2 bg-zinc-600 rounded disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {editingTransacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Editar Transação</h3>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input
                  type="text"
                  value={editingTransacao.descricao}
                  onChange={(e) => setEditingTransacao({
                    ...editingTransacao,
                    descricao: e.target.value
                  })}
                  className="w-full p-2 bg-zinc-700 rounded text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingTransacao.valor}
                  onChange={(e) => setEditingTransacao({
                    ...editingTransacao,
                    valor: parseFloat(e.target.value)
                  })}
                  className="w-full p-2 bg-zinc-700 rounded text-white"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTransacao(null)}
                  className="px-4 py-2 bg-gray-500 rounded text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 rounded text-white"
                >
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

export default Dashboard;