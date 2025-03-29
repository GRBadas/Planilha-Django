import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

interface GastoPorCategoria {
  categoria: string;
  total: number;
}

const GraficoCategorias = () => {
  const [dados, setDados] = useState<GastoPorCategoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cores = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#8AC24A', '#F06292', '#7986CB', '#A1887F'
  ];

  useEffect(() => {
    const fetchGastosPorCategoria = async () => {
      try {
        const response = await api.get('transacoes/gastos_por_categoria/');
        setDados(response.data);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar dados do gráfico');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGastosPorCategoria();
  }, []);

  const chartData = {
    labels: dados.map(item => item.categoria),
    datasets: [
      {
        data: dados.map(item => item.total),
        backgroundColor: cores.slice(0, dados.length),
        borderColor: '#1E1E1E',
        borderWidth: 1,
        hoverOffset: 10
      }
    ]
  };

  const options = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#E5E7EB',
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.formattedValue || '';
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((context.parsed / total) * 100);
            return `${label}: R$${value} (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false
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
      <div className="p-4 bg-rose-900/30 text-rose-400 rounded-lg border border-rose-700">
        {error}
      </div>
    );
  }

  if (dados.length === 0) {
    return (
      <div className="p-4 bg-zinc-800/50 text-zinc-400 rounded-lg border border-zinc-700">
        Nenhum dado disponível para exibir o gráfico
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-zinc-800 rounded-lg shadow border border-zinc-700">
      <h2 className="text-xl font-semibold mb-4 text-zinc-200">Gastos por Categoria</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3 h-80 md:h-96">
          <Pie data={chartData} options={options} />
        </div>
        <div className="w-full md:w-1/3">
          <div className="bg-zinc-700/50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-zinc-300 mb-3">Detalhes</h3>
            <ul className="space-y-2">
              {dados.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: cores[index] }}
                    ></div>
                    <span className="text-zinc-300">{item.categoria}</span>
                  </div>
                  <span className="text-zinc-100 font-medium">
                    R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </li>
              ))}
              <li className="flex justify-between items-center pt-2 mt-2 border-t border-zinc-600">
                <span className="text-zinc-300 font-medium">Total</span>
                <span className="text-white font-bold">
                  R$ {dados.reduce((sum, item) => sum + item.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficoCategorias;