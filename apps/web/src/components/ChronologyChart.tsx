'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { LedgerEvent } from '@imprint/schemas';
import { getEChartsTheme } from '../lib/echarts-theme';
import { useTheme } from '../context/ThemeContext';

interface ChronologyChartProps {
  events: LedgerEvent[];
}

export function ChronologyChart({ events }: ChronologyChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { theme } = useTheme();

  // Chronologically sort events (oldest to newest)
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: 'canvas',
      });
    }

    const chart = chartInstance.current;
    const currentTheme = getEChartsTheme(theme);

    const timestamps = sortedEvents.map((e, idx) => {
      const d = new Date(e.timestamp);
      return `#${idx + 1} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    });

    const energyData = sortedEvents.map((e) => e.impact.energy.total.expected);
    const waterData = sortedEvents.map((e) => e.impact.water.consumption.total.expected);

    const option: echarts.EChartsOption = {
      ...currentTheme,
      tooltip: {
        ...currentTheme.tooltip,
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: theme === 'dark' ? '#3A443F' : '#94A3B8',
          },
        },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const idx = params[0].dataIndex;
          const ev = sortedEvents[idx];
          if (!ev) return '';

          const d = new Date(ev.timestamp);
          const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });

          return `
            <div style="font-family: monospace; font-size: 11px; min-width: 190px;">
              <div style="font-weight: bold; margin-bottom: 4px; border-bottom: 1px solid ${
                theme === 'dark' ? '#29302C' : '#E2E8F0'
              }; padding-bottom: 3px;">
                ${ev.provider.toUpperCase()} · ${ev.modelRaw || ev.modelFamily || 'Model'}
              </div>
              <div style="color: ${theme === 'dark' ? '#8D9690' : '#64748B'}; font-size: 10px; margin-bottom: 6px;">
                ${dateStr} ${timeStr} · Turn ${ev.interactionIndex}
              </div>
              <div style="display: flex; justify-content: space-between; color: ${
                theme === 'dark' ? '#A8D5BA' : '#059669'
              }; margin-bottom: 2px;">
                <span>Energy:</span>
                <span style="font-weight: bold;">${ev.impact.energy.total.expected} Wh</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: ${
                theme === 'dark' ? '#3B82F6' : '#2563EB'
              }; margin-bottom: 2px;">
                <span>Water:</span>
                <span style="font-weight: bold;">${ev.impact.water.consumption.total.expected} mL</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: ${
                theme === 'dark' ? '#D8B878' : '#D97706'
              }; margin-bottom: 4px;">
                <span>Carbon:</span>
                <span style="font-weight: bold;">${ev.impact.carbon.total.expected} g</span>
              </div>
              <div style="border-top: 1px solid ${
                theme === 'dark' ? '#1F2421' : '#E2E8F0'
              }; padding-top: 4px; color: ${theme === 'dark' ? '#8D9690' : '#64748B'}; font-size: 9px;">
                In: ${ev.input.estimatedTokens} tok · Out: ${ev.output.estimatedTokens} tok
                ${ev.output.reasoningTokens ? `· Reason: ${ev.output.reasoningTokens} tok` : ''}
              </div>
            </div>
          `;
        },
      },
      legend: {
        data: ['Energy (Wh)', 'Water Consumed (mL)'],
        top: 0,
        right: 10,
        textStyle: {
          color: theme === 'dark' ? '#8D9690' : '#64748B',
          fontSize: 10,
          fontFamily: 'monospace',
        },
      },
      grid: {
        top: 35,
        right: 40,
        bottom: 30,
        left: 50,
      },
      xAxis: {
        type: 'category',
        data: timestamps,
        axisLine: {
          lineStyle: { color: theme === 'dark' ? '#29302C' : '#CBD5E1' },
        },
        axisLabel: {
          color: theme === 'dark' ? '#8D9690' : '#64748B',
          fontSize: 10,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Wh',
          position: 'left',
          axisLabel: {
            color: theme === 'dark' ? '#A8D5BA' : '#059669',
            fontSize: 10,
          },
          splitLine: {
            lineStyle: {
              color: theme === 'dark' ? '#171B19' : '#F1F5F9',
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          name: 'mL',
          position: 'right',
          axisLabel: {
            color: theme === 'dark' ? '#3B82F6' : '#2563EB',
            fontSize: 10,
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'Energy (Wh)',
          type: 'bar',
          data: energyData,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: theme === 'dark' ? '#A8D5BA' : '#10B981' },
              { offset: 1, color: theme === 'dark' ? '#284D39' : '#059669' },
            ]),
            borderRadius: [3, 3, 0, 0],
          },
          barMaxWidth: 20,
        },
        {
          name: 'Water Consumed (mL)',
          type: 'line',
          yAxisIndex: 1,
          data: waterData,
          smooth: true,
          showSymbol: true,
          symbolSize: 6,
          itemStyle: {
            color: theme === 'dark' ? '#3B82F6' : '#2563EB',
          },
          lineStyle: {
            width: 2.2,
            color: theme === 'dark' ? '#3B82F6' : '#2563EB',
          },
        },
      ],
    };

    chart.setOption(option, true);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sortedEvents, theme]);

  return (
    <div className="bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] rounded-xl p-4 flex flex-col justify-between transition-colors shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#059669] dark:bg-[#A8D5BA]" />
          <h2 className="text-xs font-mono font-bold text-[#111815] dark:text-[#F1F3F1] uppercase tracking-wider">
            Compute Pulse Chronology
          </h2>
        </div>
        <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8D9690]">
          CHRONOLOGICAL INTERACTION WAVEFORM (APACHE ECHARTS)
        </span>
      </div>

      <div ref={chartRef} className="w-full h-56" />
    </div>
  );
}
