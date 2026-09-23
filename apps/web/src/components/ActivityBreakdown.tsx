'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { LedgerEvent, ActivityCategory, ProviderId } from '@imprint/schemas';
import { getEChartsTheme } from '../lib/echarts-theme';
import { useTheme } from '../context/ThemeContext';

interface ActivityBreakdownProps {
  events: LedgerEvent[];
  activeMethodologyName?: string;
}

type Dimension = 'activity' | 'provider' | 'model';
type Metric = 'energy' | 'water' | 'carbon';

export function ActivityBreakdown({ events, activeMethodologyName }: ActivityBreakdownProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { theme } = useTheme();

  const [dimension, setDimension] = useState<Dimension>('activity');
  const [metric, setMetric] = useState<Metric>('energy');

  // Aggregation
  const groupMap: Record<string, number> = {};
  let totalMetricVal = 0;

  for (const ev of events) {
    let val = 0;
    if (metric === 'energy') {
      val = ev.impact.energy.total.expected;
    } else if (metric === 'water') {
      val = ev.impact.water.consumption.total.expected;
    } else {
      val = ev.impact.carbon.total.expected;
    }

    totalMetricVal += val;

    let key = 'Other';
    if (dimension === 'activity') {
      key = (ev.activity?.category || 'other').toUpperCase();
    } else if (dimension === 'provider') {
      key = (ev.provider || 'other').toUpperCase();
    } else {
      key = (ev.modelRaw || ev.modelFamily || 'Generic').toUpperCase();
    }

    groupMap[key] = (groupMap[key] || 0) + val;
  }

  const chartData = Object.entries(groupMap)
    .filter(([_, val]) => val > 0)
    .map(([name, val]) => ({
      name,
      value: Math.round(val * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value);

  const unitLabel = metric === 'energy' ? 'Wh' : metric === 'water' ? 'mL' : 'g CO₂e';

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: 'canvas',
      });
    }

    const chart = chartInstance.current;
    const currentTheme = getEChartsTheme(theme);

    const option: echarts.EChartsOption = {
      ...currentTheme,
      tooltip: {
        ...currentTheme.tooltip,
        trigger: 'item',
        formatter: (params: any) => {
          const pct = totalMetricVal > 0 ? ((params.value / totalMetricVal) * 100).toFixed(1) : '0';
          return `
            <div style="font-family: monospace; font-size: 11px;">
              <div style="font-weight: bold; margin-bottom: 3px;">${params.name}</div>
              <div style="color: ${theme === 'dark' ? '#A8D5BA' : '#059669'};">
                ${params.value} ${unitLabel} (${pct}%)
              </div>
            </div>
          `;
        },
      },
      legend: {
        orient: 'vertical',
        right: '4%',
        top: 'middle',
        textStyle: {
          color: theme === 'dark' ? '#8D9690' : '#64748B',
          fontSize: 10,
          fontFamily: 'monospace',
        },
        itemWidth: 10,
        itemHeight: 10,
      },
      series: [
        {
          name: dimension.toUpperCase(),
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['36%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: theme === 'dark' ? '#111513' : '#FFFFFF',
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
              fontFamily: 'monospace',
            },
          },
          data: chartData,
        },
      ],
    };

    chart.setOption(option, true);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [events, dimension, metric, theme, totalMetricVal]);

  return (
    <div className="bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] rounded-xl p-4 flex flex-col justify-between transition-colors shadow-sm dark:shadow-none">
      {/* Header with Title and Methodology Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D97706] dark:bg-[#D8B878]" />
          <h2 className="text-sm font-sans font-semibold text-[#111815] dark:text-[#F1F3F1] tracking-tight">
            Workload & Interaction Breakdown
          </h2>
        </div>
        {activeMethodologyName && (
          <span className="text-[10px] font-mono text-[#059669] dark:text-[#A8D5BA] px-2 py-0.5 rounded bg-emerald-50 dark:bg-[#17231C] border border-emerald-200 dark:border-[#284D39] self-start sm:self-auto font-medium">
            {activeMethodologyName}
          </span>
        )}
      </div>

      {/* Control Toolbar: Dimension & Metric Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-[#E2E8E4] dark:border-[#1F2421] text-xs font-sans">
        {/* Dimension selector */}
        <div className="flex items-center gap-1 bg-[#F1F5F3] dark:bg-[#0B0D0C] p-0.5 rounded-lg border border-[#E2E8E4] dark:border-[#29302C]">
          <button
            onClick={() => setDimension('activity')}
            className={`px-2.5 py-1 rounded-md transition-colors text-xs font-medium ${
              dimension === 'activity'
                ? 'bg-white dark:bg-[#171B19] text-[#111815] dark:text-[#F1F3F1] shadow-xs'
                : 'text-[#64748B] dark:text-[#8D9690] hover:text-[#111815] dark:hover:text-[#F1F3F1]'
            }`}
          >
            By Intent
          </button>
          <button
            onClick={() => setDimension('provider')}
            className={`px-2.5 py-1 rounded-md transition-colors text-xs font-medium ${
              dimension === 'provider'
                ? 'bg-white dark:bg-[#171B19] text-[#111815] dark:text-[#F1F3F1] shadow-xs'
                : 'text-[#64748B] dark:text-[#8D9690] hover:text-[#111815] dark:hover:text-[#F1F3F1]'
            }`}
          >
            By Provider
          </button>
          <button
            onClick={() => setDimension('model')}
            className={`px-2.5 py-1 rounded-md transition-colors text-xs font-medium ${
              dimension === 'model'
                ? 'bg-white dark:bg-[#171B19] text-[#111815] dark:text-[#F1F3F1] shadow-xs'
                : 'text-[#64748B] dark:text-[#8D9690] hover:text-[#111815] dark:hover:text-[#F1F3F1]'
            }`}
          >
            By Model
          </button>
        </div>

        {/* Metric selector */}
        <div className="flex items-center gap-1 bg-[#F1F5F3] dark:bg-[#0B0D0C] p-0.5 rounded-lg border border-[#E2E8E4] dark:border-[#29302C]">
          <button
            onClick={() => setMetric('energy')}
            className={`px-2.5 py-1 rounded-md transition-colors text-xs font-medium ${
              metric === 'energy'
                ? 'bg-white dark:bg-[#171B19] text-[#059669] dark:text-[#A8D5BA] font-semibold shadow-xs'
                : 'text-[#64748B] dark:text-[#8D9690] hover:text-[#059669] dark:hover:text-[#A8D5BA]'
            }`}
          >
            Energy (Wh)
          </button>
          <button
            onClick={() => setMetric('water')}
            className={`px-2.5 py-1 rounded-md transition-colors text-xs font-medium ${
              metric === 'water'
                ? 'bg-white dark:bg-[#171B19] text-[#2563EB] dark:text-[#3B82F6] font-semibold shadow-xs'
                : 'text-[#64748B] dark:text-[#8D9690] hover:text-[#2563EB] dark:hover:text-[#3B82F6]'
            }`}
          >
            Water (mL)
          </button>
          <button
            onClick={() => setMetric('carbon')}
            className={`px-2.5 py-1 rounded-md transition-colors text-xs font-medium ${
              metric === 'carbon'
                ? 'bg-white dark:bg-[#171B19] text-[#D97706] dark:text-[#D8B878] font-semibold shadow-xs'
                : 'text-[#64748B] dark:text-[#8D9690] hover:text-[#D97706] dark:hover:text-[#D8B878]'
            }`}
          >
            Carbon (g)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={chartRef} className="w-full h-48" />

      {/* Quick Summary Cards below chart */}
      <div className="pt-3 mt-2 border-t border-[#E2E8E4] dark:border-[#1F2421] grid grid-cols-4 gap-2 text-center font-mono">
        {(['chatgpt', 'claude', 'gemini', 'grok'] as const).map((p) => {
          const providerEvents = events.filter((e) => e.provider === p);
          let sum = 0;
          for (const ev of providerEvents) {
            if (metric === 'energy') sum += ev.impact.energy.total.expected;
            else if (metric === 'water') sum += ev.impact.water.consumption.total.expected;
            else sum += ev.impact.carbon.total.expected;
          }
          const pct = totalMetricVal > 0 ? ((sum / totalMetricVal) * 100).toFixed(0) : '0';

          return (
            <div
              key={p}
              className="p-1.5 rounded bg-[#F8FAF9] dark:bg-[#0B0D0C] border border-[#E2E8E4] dark:border-[#1F2421] flex flex-col"
            >
              <span className="text-[9px] text-[#64748B] dark:text-[#8D9690] uppercase">{p}</span>
              <span className="text-xs font-bold text-[#111815] dark:text-[#F1F3F1]">{pct}%</span>
              <span className="text-[9px] text-[#059669] dark:text-[#A8D5BA]">
                {Math.round(sum * 10) / 10} {unitLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
