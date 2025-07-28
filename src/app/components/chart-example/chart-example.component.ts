import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js';
import { ChartService } from '../../services/chart.service';

@Component({
  selector: 'app-chart-example',
  template: `
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      width: 100%;
      max-width: 600px;
      margin: 20px auto;
    }
  `]
})
export class ChartExampleComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  constructor(private chartService: ChartService) {}

  ngOnInit() {
    this.createChart();
  }

  private createChart() {
    const labels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
    const datasets = [
      {
        label: 'Ventas 2024',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#40a9ff',
        backgroundColor: 'rgba(64, 169, 255, 0.1)',
        tension: 0.4
      },
      {
        label: 'Ventas 2023',
        data: [8, 15, 7, 12, 9, 6],
        borderColor: '#ff7875',
        backgroundColor: 'rgba(255, 120, 117, 0.1)',
        tension: 0.4
      }
    ];

    this.chart = this.chartService.createLineChart(
      this.chartCanvas.nativeElement,
      labels,
      datasets,
      'Comparación de Ventas'
    );
  }

  ngOnDestroy() {
    this.chartService.destroyChart(this.chart);
  }
} 