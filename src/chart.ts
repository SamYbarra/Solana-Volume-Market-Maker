import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'fs';
import path from 'path';
import type { TradeStats } from './types.js';

interface DataPoints {
  timestamps: string[];
  balances: number[];
  trades: number[];
  marketCap: number[];
  volume: number[];
}

export class HealthChart {
  private outputDir: string;
  private width: number;
  private height: number;
  private chartJSNodeCanvas: ChartJSNodeCanvas;
  private dataPoints: DataPoints;

  constructor(outputDir: string = 'charts') {
    this.outputDir = outputDir;
    this.ensureOutputDir();
    
    this.width = 1200;
    this.height = 600;
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: this.width,
      height: this.height,
      backgroundColor: 'white'
    });
    
    this.dataPoints = {
      timestamps: [],
      balances: [],
      trades: [],
      marketCap: [],
      volume: []
    };
  }

  private ensureOutputDir(): void {
    const fullPath = path.join(process.cwd(), this.outputDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }

  addDataPoint(balance: number, tradeCount: number, marketCap: number, volume: number): void {
    const now = new Date();
    this.dataPoints.timestamps.push(now.toISOString());
    this.dataPoints.balances.push(balance);
    this.dataPoints.trades.push(tradeCount);
    this.dataPoints.marketCap.push(marketCap);
    this.dataPoints.volume.push(volume);
    
    // Keep only last 100 data points
    const maxPoints = 100;
    if (this.dataPoints.timestamps.length > maxPoints) {
      this.dataPoints.timestamps.shift();
      this.dataPoints.balances.shift();
      this.dataPoints.trades.shift();
      this.dataPoints.marketCap.shift();
      this.dataPoints.volume.shift();
    }
  }

  async generateChart(stats: TradeStats, currentBalance: number, marketCap: number, volume: number): Promise<string | null> {
    const labels = this.dataPoints.timestamps.map((ts) => {
      const date = new Date(ts);
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    });

    const configuration = {
      type: 'line' as const,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total Balance (SOL)',
            data: this.dataPoints.balances,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            yAxisID: 'y',
            tension: 0.4
          },
          {
            label: 'Market Cap (SOL)',
            data: this.dataPoints.marketCap,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            yAxisID: 'y1',
            tension: 0.4
          },
          {
            label: 'Trade Count',
            data: this.dataPoints.trades,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            yAxisID: 'y2',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Pumpfun Market Maker Health - ${new Date().toLocaleString()}`,
            font: {
              size: 18
            }
          },
          legend: {
            display: true,
            position: 'top' as const
          },
          tooltip: {
            mode: 'index' as const,
            intersect: false
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            title: {
              display: true,
              text: 'Balance (SOL)'
            }
          },
          y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            title: {
              display: true,
              text: 'Market Cap (SOL)'
            },
            grid: {
              drawOnChartArea: false
            }
          },
          y2: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            title: {
              display: true,
              text: 'Trade Count'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    };

    try {
      const imageBuffer = await this.chartJSNodeCanvas.renderToBuffer(configuration);
      const filename = `health-chart-${Date.now()}.png`;
      const filepath = path.join(process.cwd(), this.outputDir, filename);
      
      fs.writeFileSync(filepath, imageBuffer);
      
      // Also save latest as 'latest.png'
      const latestPath = path.join(process.cwd(), this.outputDir, 'latest.png');
      fs.writeFileSync(latestPath, imageBuffer);
      
      console.log(`Chart saved: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('Error generating chart:', error);
      return null;
    }
  }

  async generateStatsChart(stats: TradeStats): Promise<string | null> {
    const labels = ['Total Buys', 'Total Sells', 'Successful Buys', 'Successful Sells'];
    const data = [
      stats.totalBuys,
      stats.totalSells,
      stats.successfulBuys,
      stats.successfulSells
    ];

    const configuration = {
      type: 'bar' as const,
      data: {
        labels: labels,
        datasets: [{
          label: 'Trade Statistics',
          data: data,
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Trading Statistics',
            font: {
              size: 18
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            }
          }
        }
      }
    };

    try {
      const imageBuffer = await this.chartJSNodeCanvas.renderToBuffer(configuration);
      const filename = `stats-chart-${Date.now()}.png`;
      const filepath = path.join(process.cwd(), this.outputDir, filename);
      
      fs.writeFileSync(filepath, imageBuffer);
      console.log(`Stats chart saved: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('Error generating stats chart:', error);
      return null;
    }
  }
}
