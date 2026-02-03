import s from './index.module.css';
import{createStat}from'../Stat/index.js';
export function createStatGroup({stats=[],columns=4}){const c=document.createElement('div');c.className=s.group;c.style.gridTemplateColumns=`repeat(${columns},1fr)`;stats.forEach(stat=>c.appendChild(createStat(stat)));return c;}