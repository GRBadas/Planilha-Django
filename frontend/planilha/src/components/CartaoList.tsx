import { useEffect, useState } from 'react';
import api from '../services/api';

interface Cartao {
  id: number;
  nome: string;
  tipo: string;
  limite: string;
  saldo: string;
}

const CartaoList = () => {
  const [cartoes, setCartoes] = useState<Cartao[]>([]);

  useEffect(() => {
    const fetchCartoes = async () => {
      try {
        const response = await api.get('cartoes/');
        setCartoes(response.data);
      } catch (error) {
        console.error('Erro ao buscar cartões:', error);
      }
    };

    fetchCartoes();
  }, []);

  return (
    <div className='p-10'>
    <div className="max-w-4xl mx-auto p-6 bg-zinc-700 rounded-lg shadow-md">
      <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">Cartões</h2>
      <div className="space-y-4">
        {cartoes.map((cartao) => (
          <div
            key={cartao.id}
            className="p-4 bg-gray-50 rounded-lg shadow-sm flex justify-between items-center"
          >
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-800">{cartao.nome}</span>
              <span className="text-sm text-gray-600">{cartao.tipo}</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Limite: {cartao.limite}</p>
              <p className="text-sm text-gray-600">Saldo: {cartao.saldo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
    
  );
};

export default CartaoList;
