import s from './index.module.css';
import{createMetricCard}from'../MetricCard/index.js';
export function createKPIGrid({kpis=[],columns=4}){const c=document.createElement('div');c.className=s.grid;c.style.gridTemplateColumns=`repeat(${columns},1fr)`;kpis.forEach(kpi=>c.appendChild(createMetricCard(kpi)));return c;}