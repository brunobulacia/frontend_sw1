'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BurndownPoint {
  date: string;
  idealEffort: number;
  actualEffort: number;
}

interface BurndownChartProps {
  data: BurndownPoint[];
}

export default function BurndownChart({ data }: BurndownChartProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  // Validar que data sea un array
  const chartData = Array.isArray(data) ? data : [];

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Burndown Chart
        </h2>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No hay datos disponibles para el gráfico
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Burndown Chart
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            label={{ value: 'Fecha', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: 'Esfuerzo (horas)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number) => [`${value} horas`, '']}
            labelFormatter={formatDate}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="idealEffort"
            stroke="#94a3b8"
            strokeDasharray="5 5"
            strokeWidth={2}
            name="Línea Ideal"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="actualEffort"
            stroke="#3b82f6"
            strokeWidth={3}
            name="Esfuerzo Real"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
