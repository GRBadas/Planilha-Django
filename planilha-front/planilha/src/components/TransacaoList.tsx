import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Transacao {
  id: number;
  descricao: string;
  valor: string;
  data: string;
  tipo: string;
  categoria_nome: string;
  cartao_nome: string;
}

const TransacaoList: React.FC = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  useEffect(() => {
    const fetchTransacoes = async () => {
      try {
        const response = await api.get('transacoes/');
        setTransacoes(response.data);
      } catch (error) {
        console.error('Erro ao buscar transações:', error);
      }
    };

    fetchTransacoes();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Transações</h2>
      <ul className="space-y-4">
        {transacoes.map((transacao) => (
          <li key={transacao.id} className="bg-zinc-700 p-4 rounded-lg shadow-md">
            <div className="font-bold text-lg mb-2">
              Descrição: <span className="font-normal">{transacao.descricao}</span>
            </div>
            <div className="mb-2">
              <strong>Valor:</strong> R$ {transacao.valor}
            </div>
            <div className="mb-2">
              <strong>Tipo:</strong> {transacao.tipo}
            </div>
            <div className="mb-2">
              <strong>Categoria:</strong> {transacao.categoria_nome}
            </div>
            <div className="mb-2">
              <strong>Cartão:</strong> {transacao.cartao_nome}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransacaoList;
