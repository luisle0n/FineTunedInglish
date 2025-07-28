# Guía de Chart.js en Angular (Sin ng2-charts)

## Ventajas de usar Chart.js directamente

1. **Sin conflictos de dependencias**: No hay problemas con versiones de Angular
2. **Control total**: Acceso directo a todas las opciones de Chart.js
3. **Mejor rendimiento**: Menos capas de abstracción
4. **Flexibilidad**: Puedes personalizar todo según tus necesidades

## Instalación

Chart.js ya está instalado en tu proyecto:
```bash
npm install chart.js
```

## Uso Básico

### 1. Componente Simple

```typescript
import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-simple-chart',
  template: `<canvas #chartCanvas></canvas>`
})
export class SimpleChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  ngOnInit() {
    this.createChart();
  }

  private createChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo'],
        datasets: [{
          label: 'Ventas',
          data: [12, 19, 3],
          borderColor: '#40a9ff',
          backgroundColor: 'rgba(64, 169, 255, 0.1)'
        }]
      },
      options: {
        responsive: true
      }
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
```

### 2. Usando el ChartService

El servicio proporciona métodos predefinidos para crear diferentes tipos de gráficos:

```typescript
// Gráfico de líneas
this.chart = this.chartService.createLineChart(
  canvas,
  labels,
  datasets,
  'Título del gráfico'
);

// Gráfico de barras
this.chart = this.chartService.createBarChart(
  canvas,
  labels,
  datasets,
  'Título del gráfico'
);

// Gráfico circular
this.chart = this.chartService.createPieChart(
  canvas,
  labels,
  data,
  'Título del gráfico'
);
```

## Tipos de Gráficos Disponibles

### Gráfico de Líneas
```typescript
const datasets = [{
  label: 'Ventas 2024',
  data: [12, 19, 3, 5, 2, 3],
  borderColor: '#40a9ff',
  backgroundColor: 'rgba(64, 169, 255, 0.1)',
  tension: 0.4,
  fill: true
}];
```

### Gráfico de Barras
```typescript
const datasets = [{
  label: 'Estudiantes',
  data: [150, 120, 180, 90, 200],
  backgroundColor: '#40a9ff',
  borderColor: '#40a9ff',
  borderWidth: 1
}];
```

### Gráfico Circular
```typescript
const labels = ['Inglés Básico', 'Inglés Intermedio', 'Inglés Avanzado'];
const data = [30, 25, 20];
```

## Personalización

### Colores
```typescript
borderColor: '#40a9ff',        // Color del borde
backgroundColor: 'rgba(64, 169, 255, 0.1)',  // Color de fondo
```

### Opciones del Gráfico
```typescript
options: {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Título del gráfico'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}
```

## Actualización de Datos

```typescript
// Actualizar datos existentes
this.chart.data.datasets[0].data = [10, 20, 30, 40];
this.chart.update();

// Agregar nuevos datos
this.chart.data.labels.push('Julio');
this.chart.data.datasets[0].data.push(50);
this.chart.update();
```

## Mejores Prácticas

1. **Siempre destruir el gráfico** en `ngOnDestroy()`
2. **Usar ViewChild** para acceder al canvas
3. **Manejar errores** al obtener el contexto del canvas
4. **Usar colores consistentes** en toda la aplicación
5. **Hacer los gráficos responsivos** con `responsive: true`

## Ejemplos de Uso

### Dashboard con Múltiples Gráficos
```typescript
export class DashboardComponent implements OnInit, OnDestroy {
  private charts: Chart[] = [];

  ngOnInit() {
    this.createLineChart();
    this.createPieChart();
    this.createBarChart();
  }

  ngOnDestroy() {
    this.charts.forEach(chart => {
      this.chartService.destroyChart(chart);
    });
  }
}
```

### Gráfico con Datos Dinámicos
```typescript
updateChartData(newData: number[]) {
  if (this.chart) {
    this.chart.data.datasets[0].data = newData;
    this.chart.update('active');
  }
}
```

## Troubleshooting

### Error: "No se pudo obtener el contexto del canvas"
- Asegúrate de que el canvas esté en el DOM
- Verifica que el ViewChild esté configurado correctamente

### Gráfico no se muestra
- Verifica que Chart.js esté importado correctamente
- Asegúrate de que los datos no estén vacíos
- Revisa la consola del navegador para errores

### Problemas de rendimiento
- Destruye los gráficos cuando no se usen
- Usa `chart.update('active')` para actualizaciones parciales
- Considera usar `requestAnimationFrame` para animaciones 