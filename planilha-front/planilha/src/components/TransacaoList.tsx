import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

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

const TransacaoList = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);
  const itemsPerPage = 8;

  // Busca transações paginadas
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['transacoes-list', page],
    queryFn: () => api.get(`transacoes/?page=${page}&page_size=${itemsPerPage}`).then(res => ({
      transacoes: res.data.results,
      totalPages: Math.ceil(res.data.count / itemsPerPage)
    })),
    keepPreviousData: true
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`transacoes/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes-list'] });
      queryClient.invalidateQueries({ queryKey: ['cartoes'] });
    }
  });

  // Mutation para editar
  const updateMutation = useMutation({
    mutationFn: (transacao: Transacao) => 
      api.put(`transacoes/${transacao.id}/`, transacao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes-list'] });
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
      updateMutation.mutate({
        ...editingTransacao,
        valor: Number(editingTransacao.valor)
      });
    }
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        Erro ao carregar transações. Tente recarregar a página.
      </div>
    );
  }

  return (
    <div className="w-full p-6">

      <div className="bg-zinc-700 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Todas as Transações</h2>
          <div className="text-zinc-300">
            Página {page} de {response?.totalPages || 1}
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="space-y-3 mb-6">
          {response?.transacoes?.length === 0 ? (
            <div className="p-4 bg-zinc-600 rounded-lg text-center text-zinc-300">
              Nenhuma transação encontrada
            </div>
          ) : (
            response?.transacoes?.map((transacao) => (
              <div key={transacao.id} className="bg-zinc-600 p-4 rounded-lg hover:bg-zinc-500 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-white">{transacao.descricao}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-zinc-700 rounded-full">
                        {transacao.categoria_nome}
                      </span>
                      {transacao.cartao_nome && (
                        <span className="text-xs px-2 py-1 bg-zinc-700 rounded-full">
                          {transacao.cartao_nome}
                        </span>
                      )}
                      <span className="text-xs text-zinc-400">
                        {new Date(transacao.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-medium ${
                      transacao.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatarValor(transacao.valor)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingTransacao(transacao)}
                        className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(transacao.id)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        title="Excluir"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginação */}
        {response?.totalPages && response.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-zinc-600 rounded text-white disabled:opacity-50"
            >
              Anterior
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, response.totalPages) }).map((_, i) => {
                const pageNumber = page <= 3 
                  ? i + 1 
                  : page >= response.totalPages - 2 
                    ? response.totalPages - 4 + i 
                    : page - 2 + i;
                
                return (
                  <button
                    key={i}
                    onClick={() => setPage(pageNumber)}
                    className={`w-10 h-10 rounded-full ${
                      page === pageNumber 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-zinc-600 text-white hover:bg-zinc-500'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === response.totalPages}
              className="px-4 py-2 bg-zinc-600 rounded text-white disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {editingTransacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Editar Transação</h3>
              <button
                onClick={() => setEditingTransacao(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
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
                    className="w-full p-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500"
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
                      className="w-full p-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500"
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
                      className="w-full p-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTransacao(null)}
                  className="px-4 py-2 bg-zinc-600 text-white rounded hover:bg-zinc-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-500 flex items-center gap-1"
                  disabled={updateMutation.isLoading}
                >
                  {updateMutation.isLoading ? (
                    <>
                      <span className="animate-spin">↻</span> Salvando...
                    </>
                  ) : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransacaoList;