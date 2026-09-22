'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { LedgerEvent } from '@imprint/schemas';
import { ECHARTS_DARK_THEME } from '../lib/echarts-theme';

interface ChronologyChartProps {
  events: LedgerEvent[];
}

export function ChronologyChart({ events }: ChronologyChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

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

    const timestamps = sortedEvents.map((e, idx) => {
      const d = new Date(e.timestamp);
      return `#${idx + 1} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    });

    const energyData = sortedEvents.map((e) => e.impact.energy.total.expected);
    const waterData = sortedEvents.map((e) => e.impact.water.consumption.total.expected);

    const option: echarts.EChartsOption = {
      ...ECHARTS_DARK_THEME,
      tooltip: {
        ...ECHARTS_DARK_THEME.tooltip,
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#3A443F',
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
            <div style="font-family: monospace; font-size: 11px; min-width: 180px;">
              <div style="font-weight: bold; color: #F1F3F1; margin-bottom: 4px; border-bottom: 1px solid #29302C; padding-bottom: 3px;">
                ${ev.provider.toUpperCase()} · ${ev.modelRaw || ev.modelFamily || 'Model'}
              </div>
              <div style="color: #8D9690; font-size: 10px; margin-bottom: 6px;">${dateStr} ${timeStr} · Turn ${ev.interactionIndex}</div>
              <div style="display: flex; justify-content: space-between; color: #A8D5BA; margin-bottom: 2px;">
                <span>Energy:</span>
                <span style="font-weight: bold;">${ev.impact.energy.total.expected} Wh</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #3B82F6; margin-bottom: 2px;">
                <span>Water:</span>
                <span style="font-weight: bold;">${ev.impact.water.consumption.total.expected} mL</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #D8B878; margin-bottom: 4px;">
                <span>Carbon:</span>
                <span style="font-weight: bold;">${ev.impact.carbon.total.expected} g</span>
              </div>
              <div style="border-top: 1px solid #1F2421; padding-top: 4px; color: #8D9690; font-size: 9px;">
                In: ${ev.input.estimatedTokens} tok · Out: ${ev.output.estimatedTokens} tok
                ${ev.output.reasoningTokens ? `· <span style="color: #D8B878;">Reason: ${ev.output.reasoningTokens} tok</span>` : ''}
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
          color: '#8D9690',
          fontSize: 10,
          fontFamily: 'monospace',
        },
      },
      grid: {
        top: 35,
        right: 35,
        bottom: 30,
        left: 45,
      },
      xAxis: {
        type: 'category',
        data: timestamps,
        axisLine: { lineStyle: { color: '#29302C' } },
        axisLabel: { color: '#8D9690', fontSize: 10 },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Wh',
          position: 'left',
          nameTextStyle: { color: '#A8D5BA', fontSize: 10, fontFamily: 'monospace' },
          splitLine: { lineStyle: { color: '#171B19', type: 'dashed' } },
          axisLabel: { color: '#8D9690', fontSize: 10 },
        },
        {
          type: 'value',
          name: 'mL',
          position: 'right',
          nameTextStyle: { color: '#3B82F6', fontSize: 10, fontFamily: 'monospace' },
          splitLine: { show: false },
          axisLabel: { color: '#8D9690', fontSize: 10 },
        },
      ],
      series: [
        {
          name: 'Energy (Wh)',
          type: 'bar',
          data: energyData,
          yAxisIndex: 0,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#A8D5BA' },
              { offset: 1, color: '#284D39' },
            ]),
            borderRadius: [3, 3, 0, 0],
          },
          barMaxWidth: 24,
        },
        {
          name: 'Water Consumed (mL)',
          type: 'line',
          smooth: true,
          data: waterData,
          yAxisIndex: 1,
          lineStyle: {
            color: '#3B82F6',
            width: 2,
          },
          itemStyle: {
            color: '#3B82F6',
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
  }, [sortedEvents]);

  return (
    <div className="bg-[#111513] border border-[#29302C] rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#A8D5BA]" />
          <h2 className="text-xs font-mono font-bold text-[#F1F3F1] uppercase tracking-wider">
            Compute Pulse Chronology
          </h2>
        </div>
        <span className="text-[10px] font-mono text-[#8D9690]">
          CHRONOLOGICAL INTERACTION WAVEFORM (APACHE ECHARTS)
        </span>
      </div>
      <div ref={chartRef} className="w-full h-64" />
    </div>
  );
}
