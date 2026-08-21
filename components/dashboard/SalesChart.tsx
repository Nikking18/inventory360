'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface SalesChartProps {
  chartType: 'line' | 'bar';
  chartData: any;
  chartOptions: any;
}

export default function SalesChart({ chartType, chartData, chartOptions }: SalesChartProps) {
  if (chartType === 'line') {
    return <Line data={chartData} options={chartOptions as any} />;
  }
  return <Bar data={chartData} options={chartOptions as any} />;
}
