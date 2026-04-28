import React from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import '../styles/pages.css';

const analyticsKpis = [
  { label: 'Employee Growth', value: '+8.4%', note: 'Compared to last quarter' },
  { label: 'Average Attendance', value: '94.7%', note: 'Across all departments' },
  { label: 'Attrition Risk', value: '6.2%', note: 'Employees in watch-list band' },
  { label: 'Hiring Velocity', value: '18 days', note: 'Average time-to-fill' },
];

const trends = [
  { metric: 'Hiring Efficiency', score: 78 },
  { metric: 'Performance Uplift', score: 84 },
  { metric: 'Leave Stabilization', score: 71 },
  { metric: 'Training Completion', score: 89 },
];

const Analytics = () => {
  return (
    <div className="page-container">
      <Header
        title="Analytics"
        subtitle="Advanced workforce analytics under Reports & Analytics"
      />

      <Card title="Key Analytics Indicators">
        <div className="summary-grid">
          {analyticsKpis.map((kpi) => (
            <div key={kpi.label} className="summary-item">
              <span className="summary-label">{kpi.label}</span>
              <span className="summary-value">{kpi.value}</span>
              <small style={{ color: 'var(--text-secondary)', marginTop: 6, display: 'block' }}>
                {kpi.note}
              </small>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Workforce Trend Scores">
        <div className="report-chart">
          {trends.map((item) => (
            <div key={item.metric} className="chart-item">
              <div className="item-label">
                <strong>{item.metric}</strong>
                <span className="item-count">{item.score}/100</span>
              </div>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${item.score}%` }}>
                  {item.score}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
