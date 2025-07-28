import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js';
import { ChartService } from '../../services/chart.service';

@Component({
  selector: 'app-dashboard-charts',
  template: `
    <div class="dashboard-container">
      <div class="chart-row">
        <div class="chart-card">
          <h3>Ventas Mensuales</h3>
          <canvas #lineChartCanvas></canvas>
        </div>
        <div class="chart-card">
          <h3>Distribución por Categoría</h3>
          <canvas #pieChartCanvas></canvas>
        </div>
      </div>
      <div class="chart-row">
        <div class="chart-card">
          <h3>Rendimiento por Región</h3>
          <canvas #barChartCanvas></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
    
    .chart-row {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .chart-card {
      flex: 1;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .chart-card h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 18px;
    }
    
    @media (max-width: 768px) {
      .chart-row {
        flex-direction: column;
      }
    }
  `]
})
export class DashboardChartsComponent implements OnInit, OnDestroy {
  @ViewChild('lineChartCanvas', { static: true }) lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChartCanvas', { static: true }) pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartCanvas', { static: true }) barChartCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];

  constructor(private chartService: ChartService) {}

  ngOnInit() {
    this.createLineChart();
    this.createPieChart();
    this.createBarChart();
  }

  private createLineChart() {
    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const datasets = [
      {
        label: 'Ventas 2024',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: '#40a9ff',
        backgroundColor: 'rgba(64, 169, 255, 0.1)',
        tension: 0.4,
        fill: true
      }
    ];

    const chart = this.chartService.createLineChart(
      this.lineChartCanvas.nativeElement,
      labels,
      datasets,
      ''
    );
    this.charts.push(chart);
  }

  private createPieChart() {
    const labels = ['Inglés Básico', 'Inglés Intermedio', 'Inglés Avanzado', 'TOEFL', 'IELTS'];
    const data = [30, 25, 20, 15, 10];

    const chart = this.chartService.createPieChart(
      this.pieChartCanvas.nativeElement,
      labels,
      data,
      ''
    );
    this.charts.push(chart);
  }

  private createBarChart() {
    const labels = ['Norte', 'Sur', 'Este', 'Oeste', 'Centro'];
    const datasets = [
      {
        label: 'Estudiantes',
        data: [150, 120, 180, 90, 200],
        backgroundColor: '#40a9ff',
        borderColor: '#40a9ff',
        borderWidth: 1
      }
    ];

    const chart = this.chartService.createBarChart(
      this.barChartCanvas.nativeElement,
      labels,
      datasets,
      ''
    );
    this.charts.push(chart);
  }

  ngOnDestroy() {
    this.charts.forEach(chart => {
      this.chartService.destroyChart(chart);
    });
  }
} 