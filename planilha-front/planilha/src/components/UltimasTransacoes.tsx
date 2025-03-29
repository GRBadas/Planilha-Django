import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface Transacao {
  id: number;
  descricao: string;
  valor: number | string;
  tipo: 'entrada' | 'saida';
  data: string;
  categoria_nome?: string;
  cartao_nome?: string;
}

const UltimasTransacoes: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ultimas-transacoes'],
    queryFn: () => api.get('transacoes/?limit=5').then(res => res.data.results || res.data)
  });

  const formatarValor = (valor: number | string): string => {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (isLoading) return (
    <div className="bg-zinc-800 p-6 rounded-lg shadow">
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-zinc-800 p-6 rounded-lg shadow text-rose-400">
      Erro ao carregar transações
    </div>
  );

  return (
    <div className="bg-zinc-800 p-6 rounded-lg shadow border border-zinc-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-zinc-200">Últimas Transações</h2>
        <button className="text-xs text-violet-400 hover:text-violet-300">
          Ver todas
        </button>
      </div>
      
      {data?.length === 0 ? (
        <p className="text-center py-4 text-zinc-400">Nenhuma transação encontrada</p>
      ) : (
        <ul className="space-y-3">
          {data?.map((transacao: Transacao) => (
            <li 
              key={transacao.id} 
              className="bg-zinc-700/50 hover:bg-zinc-700 p-4 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-white">{transacao.descricao}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-zinc-400">
                      {new Date(transacao.data).toLocaleDateString('pt-BR')}
                    </span>
                    {transacao.categoria_nome && (
                      <span className="text-xs px-2 py-0.5 bg-zinc-600 rounded-full">
                        {transacao.categoria_nome}
                      </span>
                    )}
                    {transacao.cartao_nome && (
                      <span className="text-xs px-2 py-0.5 bg-zinc-600 rounded-full">
                        {transacao.cartao_nome}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  transacao.tipo === 'entrada' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {transacao.tipo === 'entrada' ? '+' : '-'} {formatarValor(transacao.valor)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UltimasTransacoes;