import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import NovaTransacao from '../components/NovaTransação';

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

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-center mb-6 dark:text-violet-600">
        Painel Principal
      </h1>
      
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
