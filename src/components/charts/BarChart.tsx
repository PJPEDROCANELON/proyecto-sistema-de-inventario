// C:\Users\pedro\Desktop\project\src\components\charts\BarChart.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartType, // Importa ChartType para tipado
  TooltipItem // Importa TooltipItem para tipado de callbacks
} from 'chart.js';

// Registrar los componentes necesarios para Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  // Opciones básicas para el gráfico de barras
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1', // slate-300
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          // CORRECCIÓN: Tipado específico para 'context'
          label: function(context: TooltipItem<ChartType>) { 
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            // Asegúrate de que context.parsed sea numérico para toLocaleString
            if (typeof context.parsed.y === 'number') { 
              label += new Intl.NumberFormat('es-ES', { style: 'decimal' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#cbd5e1', // slate-300
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#cbd5e1', // slate-300
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  if (!data || !data.datasets || data.datasets.length === 0 || data.datasets[0].data.every(val => val === 0)) {
    return (
      <div className="flex justify-center items-center h-full text-slate-500">
        No hay datos disponibles para mostrar este gráfico.
      </div>
    );
  }

  return <Bar data={data} options={options} />;
};

export default BarChart;
