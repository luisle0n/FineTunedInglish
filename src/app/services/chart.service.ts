import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  createLineChart(
    canvas: HTMLCanvasElement,
    labels: string[],
    datasets: any[],
    title: string = ''
  ): Chart {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: !!title,
            text: title
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    return new Chart(ctx, config);
  }

  createBarChart(
    canvas: HTMLCanvasElement,
    labels: string[],
    datasets: any[],
    title: string = ''
  ): Chart {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: !!title,
            text: title
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    return new Chart(ctx, config);
  }

  createPieChart(
    canvas: HTMLCanvasElement,
    labels: string[],
    data: number[],
    title: string = ''
  ): Chart {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');

    const config: ChartConfiguration = {
      type: 'pie' as ChartType,
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            '#40a9ff',
            '#ff7875',
            '#95de64',
            '#ffc53d',
            '#b37feb',
            '#ff85c0'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: !!title,
            text: title
          }
        }
      }
    };

    return new Chart(ctx, config);
  }

  destroyChart(chart: Chart | null) {
    if (chart) {
      chart.destroy();
    }
  }
} 