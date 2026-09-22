'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { LedgerEvent } from '@imprint/schemas';
import { ECHARTS_DARK_THEME } from '../lib/echarts-theme';

interface DualWaterChartProps {
  events: LedgerEvent[];
}

export function DualWaterChart({ events }: DualWaterChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  let onsiteConsumption = 0;
  let upstreamConsumption = 0;
  let onsiteWithdrawal = 0;
  let upstreamWithdrawal = 0;

  for (const ev of events) {
    onsiteConsumption += ev.impact.water.consumption.onsite.expected;
    upstreamConsumption += ev.impact.water.consumption.upstream.expected;
    onsiteWithdrawal += ev.impact.water.withdrawal.onsite.expected;
    upstreamWithdrawal += ev.impact.water.withdrawal.upstream.expected;
  }

  const round = (n: number) => Math.round(n * 10) / 10;

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
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let res = `<div style="font-family: monospace; font-size: 11px;">
            <div style="font-weight: bold; color: #F1F3F1; margin-bottom: 4px; border-bottom: 1px solid #29302C; padding-bottom: 2px;">
              ${params[0].name}
            </div>`;
          params.forEach((p) => {
            res += `<div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 2px;">
              <span style="color: #8D9690;">${p.seriesName}:</span>
              <span style="font-weight: bold; color: ${p.color};">${p.value} mL</span>
            </div>`;
          });
          res += `</div>`;
          return res;
        },
      },
      legend: {
        data: ['Onsite Datacenter Cooling', 'Upstream Grid Thermoelectric'],
        top: 0,
        textStyle: { color: '#8D9690', fontSize: 10, fontFamily: 'monospace' },
      },
      grid: {
        top: 35,
        right: 20,
        bottom: 25,
        left: 55,
      },
      xAxis: {
        type: 'value',
        name: 'mL',
        axisLabel: { color: '#8D9690', fontSize: 10 },
        splitLine: { lineStyle: { color: '#171B19', type: 'dashed' } },
      },
      yAxis: {
        type: 'category',
        data: ['Withdrawal (Gross)', 'Consumption (Net Lost)'],
        axisLabel: { color: '#F1F3F1', fontSize: 10, fontFamily: 'monospace' },
        axisLine: { lineStyle: { color: '#29302C' } },
      },
      series: [
        {
          name: 'Onsite Datacenter Cooling',
          type: 'bar',
          stack: 'total',
          data: [round(onsiteWithdrawal), round(onsiteConsumption)],
          itemStyle: {
            color: '#3B82F6',
          },
        },
        {
          name: 'Upstream Grid Thermoelectric',
          type: 'bar',
          stack: 'total',
          data: [round(upstreamWithdrawal), round(upstreamConsumption)],
          itemStyle: {
            color: '#60A5FA',
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
  }, [events]);

  return (
    <div className="bg-[#111513] border border-[#29302C] rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          <h2 className="text-xs font-mono font-bold text-[#F1F3F1] uppercase tracking-wider">
            Dual Water Accounting Matrix
          </h2>
        </div>
        <span className="text-[10px] font-mono text-[#8D9690]">
          ONSITE VS. UPSTREAM · WITHDRAWAL VS. CONSUMPTION
        </span>
      </div>

      <div ref={chartRef} className="w-full h-48" />

      <div className="pt-3 mt-2 border-t border-[#1F2421] text-[10px] font-mono text-[#8D9690] flex items-center justify-between">
        <span>Total Withdrawn: {round(onsiteWithdrawal + upstreamWithdrawal)} mL</span>
        <span className="text-[#3B82F6] font-bold">
          Evaporative Net Loss: {round(onsiteConsumption + upstreamConsumption)} mL
        </span>
      </div>
    </div>
  );
}
