import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { Line } from "react-chartjs-2";
import { Chart } from 'chart.js/auto';
import API_URL from "../config/apiConfig";

export default function ReportsPerformancePage({ onLogout }) {
    const [performanceData, setPerformanceData] = useState({
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
            label: 'Eficiência de Auto-Matching (%)',
            data: [65, 72, 68, 85, 92, 94],
            borderColor: '#0071e3',
            backgroundColor: 'rgba(0, 113, 227, 0.1)',
            fill: true,
            tension: 0.4
        }]
    });

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
            x: { grid: { display: false } }
        }
    };

    return (
        <DashboardLayout onLogout={onLogout}>
            <div className="performance-page-apple">
                <div className="page-header-apple">
                    <h1>Desempenho da IA</h1>
                    <p>Acompanhe a evolução da precisão do motor Kutexa ao longo do tempo.</p>
                </div>

                <div className="chart-container-large glass-effect apple-shadow">
                    <div className="chart-header">
                        <h3>Tendência de Automação</h3>
                        <p>Percentagem de transações resolvidas sem intervenção manual.</p>
                    </div>
                    <div className="chart-wrapper">
                        <Line data={performanceData} options={chartOptions} />
                    </div>
                </div>

                <div className="metrics-summary-grid">
                    <div className="mini-card glass-effect">
                        <label>Tempo Médio de Escaneamento</label>
                        <span>1.2s</span>
                    </div>
                    <div className="mini-card glass-effect">
                        <label>Taxa de Falsos Positivos</label>
                        <span>0.02%</span>
                    </div>
                    <div className="mini-card glass-effect">
                        <label>Processamento Mensal</label>
                        <span>+12.4k</span>
                    </div>
                </div>
            </div>

            <style>{`
                .performance-page-apple { padding: 20px 0; }
                .chart-container-large { padding: 2.5rem; border-radius: 24px; margin-top: 2rem; }
                .chart-header { margin-bottom: 2rem; }
                .chart-header h3 { font-size: 1.4rem; margin-bottom: 0.5rem; }
                .chart-header p { color: var(--system-text-secondary); font-size: 0.9rem; }
                .chart-wrapper { height: 400px; width: 100%; }

                .metrics-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 2rem; }
                .mini-card { padding: 1.5rem; border-radius: 16px; display: flex; flex-direction: column; gap: 8px; }
                .mini-card label { font-size: 0.8rem; color: var(--system-text-secondary); font-weight: 500; }
                .mini-card span { font-size: 1.5rem; font-weight: 700; color: var(--system-accent); }

                @media (max-width: 900px) {
                    .metrics-summary-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </DashboardLayout>
    );
}
