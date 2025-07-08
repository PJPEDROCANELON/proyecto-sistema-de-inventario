// C:\Users\pedro\Desktop\project\src\components\charts\DoughnutChart.tsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  ChartType,    // Importa ChartType
  TooltipItem   // Importa TooltipItem
} from 'chart.js';

// Registrar los componentes necesarios para Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      hoverOffset: number;
    }[];
  };
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data }) => {
  // Opciones básicas para el gráfico de dona
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Permite que el gráfico ajuste su tamaño al contenedor
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#cbd5e1', // slate-300
        },
      },
      tooltip: {
        callbacks: {
          // CORRECCIÓN: Tipado específico para 'context'
          label: function(context: TooltipItem<ChartType>) { 
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            // Asegúrate de que context.parsed sea numérico para toLocaleString
            if (typeof context.parsed === 'number') { 
              label += new Intl.NumberFormat('es-ES', { style: 'decimal' }).format(context.parsed);
            }
            return label;
          }
        }
      }
    },
  };

  if (!data || !data.datasets || data.datasets.length === 0 || data.datasets[0].data.every(val => val === 0)) {
    return (
      <div className="flex justify-center items-center h-full text-slate-500">
        No hay datos disponibles para mostrar este gráfico.
      </div>
    );
  }

  return <Doughnut data={data} options={options} />;
};

export default DoughnutChart;
