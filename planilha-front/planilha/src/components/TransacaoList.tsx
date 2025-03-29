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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-900/30 text-rose-400 rounded-lg border border-rose-700">
        Erro ao carregar transações. Tente recarregar a página.
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <div className="bg-zinc-800 p-6 rounded-lg shadow border border-zinc-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-zinc-200">Todas as Transações</h2>
          <div className="text-sm text-zinc-400">
            Página {page} de {response?.totalPages || 1}
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="space-y-3 mb-6">
          {response?.transacoes?.length === 0 ? (
            <div className="p-6 text-center text-zinc-400 bg-zinc-800/50 rounded-lg">
              Nenhuma transação encontrada
            </div>
          ) : (
            response?.transacoes?.map((transacao) => (
              <div 
                key={transacao.id} 
                className="bg-zinc-700/50 hover:bg-zinc-700 p-4 rounded-lg transition-colors border border-zinc-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-white">{transacao.descricao}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs text-zinc-400">
                        {new Date(transacao.data).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-xs px-2 py-1 bg-zinc-700 rounded-full">
                        {transacao.categoria_nome}
                      </span>
                      {transacao.cartao_nome && (
                        <span className="text-xs px-2 py-1 bg-zinc-700 rounded-full">
                          {transacao.cartao_nome}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${
                      transacao.tipo === 'entrada' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {transacao.tipo === 'entrada' ? '+' : '-'} {formatarValor(transacao.valor)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingTransacao(transacao)}
                        className="p-1 text-amber-400 hover:text-amber-300 transition-colors"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(transacao.id)}
                        className="p-1 text-rose-400 hover:text-rose-300 transition-colors"
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
              className="px-4 py-2 bg-zinc-700 rounded text-zinc-300 disabled:opacity-50 hover:bg-zinc-600 transition-colors"
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      page === pageNumber 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
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
              className="px-4 py-2 bg-zinc-700 rounded text-zinc-300 disabled:opacity-50 hover:bg-zinc-600 transition-colors"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

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
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Descrição*</label>
                  <input
                    type="text"
                    value={editingTransacao.descricao}
                    onChange={(e) => setEditingTransacao({
                      ...editingTransacao,
                      descricao: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 border border-zinc-600"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Valor (R$)*</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={editingTransacao.valor}
                      onChange={(e) => setEditingTransacao({
                        ...editingTransacao,
                        valor: parseFloat(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 border border-zinc-600"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Data*</label>
                    <input
                      type="date"
                      value={editingTransacao.data}
                      onChange={(e) => setEditingTransacao({
                        ...editingTransacao,
                        data: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-zinc-700 rounded text-white focus:ring-2 focus:ring-violet-500 border border-zinc-600"
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
                  disabled={updateMutation.isLoading}
                >
                  {updateMutation.isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Salvar
                    </>
                  )}
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