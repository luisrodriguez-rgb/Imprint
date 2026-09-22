'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { LedgerEvent, ActivityCategory, ProviderId } from '@imprint/schemas';
import { ECHARTS_DARK_THEME } from '../lib/echarts-theme';

interface ActivityBreakdownProps {
  events: LedgerEvent[];
}

export function ActivityBreakdown({ events }: ActivityBreakdownProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Group energy by activity
  const activityMap: Record<ActivityCategory, number> = {
    coding: 0,
    research: 0,
    study: 0,
    writing: 0,
    work: 0,
    entertainment: 0,
    other: 0,
    unknown: 0,
  };

  // Group energy by provider
  const providerMap: Record<ProviderId, number> = {
    chatgpt: 0,
    claude: 0,
    gemini: 0,
    grok: 0,
    other: 0,
  };

  let totalEnergy = 0;

  for (const ev of events) {
    const energy = ev.impact.energy.total.expected;
    totalEnergy += energy;
    const cat = ev.activity.category as ActivityCategory;
    activityMap[cat] = (activityMap[cat] || 0) + energy;
    providerMap[ev.provider] = (providerMap[ev.provider] || 0) + energy;
  }

  const activityData = Object.entries(activityMap)
    .filter(([_, val]) => val > 0)
    .map(([name, val]) => ({
      name: name.toUpperCase(),
      value: Math.round(val * 100) / 100,
    }));

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: 'canvas',
      });
    }

    const chart = chartInstance.current;

    const option: echarts.EChartsOption = {
      ...ECHARTS_DARK_THEME,
      tooltip: {
        ...ECHARTS_DARK_THEME.tooltip,
        trigger: 'item',
        formatter: (params: any) => {
          const pct = totalEnergy > 0 ? ((params.value / totalEnergy) * 100).toFixed(1) : '0';
          return `
            <div style="font-family: monospace; font-size: 11px;">
              <div style="color: #F1F3F1; font-weight: bold; margin-bottom: 2px;">${params.name}</div>
              <div style="color: #A8D5BA;">${params.value} Wh (${pct}%)</div>
            </div>
          `;
        },
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: {
          color: '#8D9690',
          fontSize: 10,
          fontFamily: 'monospace',
        },
        itemWidth: 10,
        itemHeight: 10,
      },
      series: [
        {
          name: 'Activity',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#111513',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 11,
              fontWeight: 'bold',
              color: '#F1F3F1',
              fontFamily: 'monospace',
            },
          },
          data: activityData,
        },
      ],
    };

    chart.setOption(option, true);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [events]);

  return (
    <div className="bg-[#111513] border border-[#29302C] rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D8B878]" />
          <h2 className="text-xs font-mono font-bold text-[#F1F3F1] uppercase tracking-wider">
            Activity & Workload Breakdown
          </h2>
        </div>
        <span className="text-[10px] font-mono text-[#8D9690]">ENERGY BY INTENT</span>
      </div>

      <div ref={chartRef} className="w-full h-48" />

      {/* Provider Quick Distribution */}
      <div className="pt-3 mt-2 border-t border-[#1F2421] grid grid-cols-4 gap-2 text-center font-mono">
        {(['chatgpt', 'claude', 'gemini', 'grok'] as const).map((p) => {
          const val = providerMap[p] || 0;
          const pct = totalEnergy > 0 ? ((val / totalEnergy) * 100).toFixed(0) : '0';
          return (
            <div key={p} className="p-1.5 rounded bg-[#0B0D0C] border border-[#1F2421] flex flex-col">
              <span className="text-[9px] text-[#8D9690] uppercase">{p}</span>
              <span className="text-xs font-bold text-[#F1F3F1]">{pct}%</span>
              <span className="text-[9px] text-[#A8D5BA]">{Math.round(val * 10) / 10} Wh</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
