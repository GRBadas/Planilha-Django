import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Cartao {
  id: number;
  nome: string;
}

interface Categoria {
  id: number;
  nome: string;
}

const NovaTransacao: React.FC = () => {
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [tipo, setTipo] = useState('');
  const [cartaoSelecionado, setCartaoSelecionado] = useState<number | string>('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | string>('');

  // Carregar cartões e categorias
  useEffect(() => {
    const fetchCartoes = async () => {
      try {
        const response = await api.get('cartoes/');
        setCartoes(response.data);
      } catch (error) {
        console.error('Erro ao buscar cartões:', error);
      }
    };

    const fetchCategorias = async () => {
      try {
        const response = await api.get('categorias/');
        setCategorias(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchCartoes();
    fetchCategorias();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const transacao = {
      descricao,
      valor: parseFloat(valor), // Assegure-se de que o valor está sendo enviado como número
      data,
      tipo, // Aqui, certifique-se de que tipo seja uma string (entrada ou saída)
      cartao: cartaoSelecionado, // ID do cartão
      categoria: categoriaSelecionada, // ID da categoria
    };

    console.log("Dados enviados:", transacao); // Verifique os dados antes de enviar

    try {
      await api.post('transacoes/', transacao);
      alert('Transação adicionada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar transação:', error.response ? error.response.data : error);
      alert('Erro ao adicionar transação');
    }
  };

  return (
    <div className='p-10'>
    <div className="max-w-4xl mx-auto p-10 bg-zinc-700 rounded-lg shadow-md">
      <h2 className="text-3xl font-semibold text-center mb-6 text-gray-300">Adicionar Nova Transação</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição:</label>
          <input
            type="text"
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="valor" className="block text-sm font-medium text-gray-700">Valor:</label>
          <input
            type="number"
            id="valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="data" className="block text-sm font-medium text-gray-700">Data:</label>
          <input
            type="date"
            id="data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo:</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option className='bg-zinc-400' value="">Selecione</option>
            <option className='bg-zinc-400' value="entrada">Entrada</option>
            <option className='bg-zinc-400' value="saida">Saída</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="cartao" className="block text-sm font-medium text-gray-700">Cartão:</label>
          <select
            id="cartao"
            value={cartaoSelecionado}
            onChange={(e) => setCartaoSelecionado(Number(e.target.value))}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecione um cartão</option>
            {cartoes.map((cartao) => (
              <option className='bg-zinc-400' key={cartao.id} value={cartao.id}>
                {cartao.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoria:</label>
          <select
            id="categoria"
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(Number(e.target.value))}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((categoria) => (
              <option className='bg-zinc-400' key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Adicionar Transação
        </button>
      </form>
    </div>
    </div>
  );
};

export default NovaTransacao;
