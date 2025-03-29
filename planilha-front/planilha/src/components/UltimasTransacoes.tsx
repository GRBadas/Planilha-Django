import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface Transacao {
  id: number;
  descricao: string;
  valor: number | string; // Aceita ambos os tipos
  tipo: 'entrada' | 'saida';
  data: string;
}

const UltimasTransacoes: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ultimas-transacoes'],
    queryFn: () => api.get('transacoes/?limit=5').then(res => res.data)
  });

  if (isLoading) return <div className="text-white">Carregando...</div>;
  
  if (error) return <div className="text-red-500">Erro ao carregar transações</div>;

  // Função para garantir que o valor seja tratado como número
  const formatarValor = (valor: number | string): string => {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    return isNaN(numero) ? '0.00' : numero.toFixed(2);
  };

  return (
    <div className="bg-zinc-700 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-white">Últimas Transações</h2>
      {data?.length === 0 ? (
        <p className="text-zinc-300">Nenhuma transação encontrada</p>
      ) : (
        <ul className="space-y-3">
          {data?.map((transacao: Transacao) => (
            <li key={transacao.id} className="bg-zinc-600 p-3 rounded">
              <div className="flex justify-between">
                <span className="font-medium text-white">{transacao.descricao}</span>
                <span className={`${transacao.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'}`}>
                  R$ {formatarValor(transacao.valor)}
                </span>
              </div>
              <div className="text-sm text-zinc-300">
                {new Date(transacao.data).toLocaleDateString('pt-BR')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UltimasTransacoes;