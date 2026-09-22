'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { LedgerEvent } from '@imprint/schemas';
import { getEChartsTheme } from '../lib/echarts-theme';
import { useTheme } from '../context/ThemeContext';
import { Info } from 'lucide-react';

interface DualWaterChartProps {
  events: LedgerEvent[];
}

export function DualWaterChart({ events }: DualWaterChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { theme } = useTheme();

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
    const currentTheme = getEChartsTheme(theme);

    const option: echarts.EChartsOption = {
      ...currentTheme,
      tooltip: {
        ...currentTheme.tooltip,
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let res = `<div style="font-family: monospace; font-size: 11px; min-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 4px; border-bottom: 1px solid ${
              theme === 'dark' ? '#29302C' : '#E2E8F0'
            }; padding-bottom: 2px;">
              ${params[0].name}
            </div>`;
          params.forEach((p) => {
            res += `<div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 2px;">
              <span style="color: ${theme === 'dark' ? '#8D9690' : '#64748B'};">${p.seriesName}:</span>
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
        textStyle: {
          color: theme === 'dark' ? '#8D9690' : '#64748B',
          fontSize: 10,
          fontFamily: 'monospace',
        },
      },
      grid: {
        top: 35,
        right: 25,
        bottom: 25,
        left: 140, // Expanded margin so labels are never cut off
      },
      xAxis: {
        type: 'value',
        name: 'mL',
        axisLabel: {
          color: theme === 'dark' ? '#8D9690' : '#64748B',
          fontSize: 10,
        },
        splitLine: {
          lineStyle: {
            color: theme === 'dark' ? '#171B19' : '#F1F5F9',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: ['Gross Withdrawal', 'Net Evaporative Loss'],
        axisLabel: {
          color: theme === 'dark' ? '#F1F3F1' : '#0F172A',
          fontSize: 10,
          fontFamily: 'monospace',
          fontWeight: 'bold',
        },
        axisLine: {
          lineStyle: {
            color: theme === 'dark' ? '#29302C' : '#CBD5E1',
          },
        },
      },
      series: [
        {
          name: 'Onsite Datacenter Cooling',
          type: 'bar',
          stack: 'total',
          data: [round(onsiteWithdrawal), round(onsiteConsumption)],
          itemStyle: {
            color: theme === 'dark' ? '#3B82F6' : '#2563EB',
          },
        },
        {
          name: 'Upstream Grid Thermoelectric',
          type: 'bar',
          stack: 'total',
          data: [round(upstreamWithdrawal), round(upstreamConsumption)],
          itemStyle: {
            color: theme === 'dark' ? '#60A5FA' : '#93C5FD',
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
  }, [events, theme, onsiteConsumption, upstreamConsumption, onsiteWithdrawal, upstreamWithdrawal]);

  return (
    <div className="bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] rounded-xl p-4 flex flex-col justify-between transition-colors shadow-sm dark:shadow-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6]" />
          <h2 className="text-xs font-mono font-bold text-[#111815] dark:text-[#F1F3F1] uppercase tracking-wider">
            Dual Water Footprint Matrix
          </h2>
        </div>
        <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8D9690]">
          DIRECT COOLING VS. ELECTRIC GRID WATER
        </span>
      </div>

      {/* Scientific explanation pill */}
      <div className="text-[10px] font-mono text-[#64748B] dark:text-[#8D9690] bg-[#F8FAF9] dark:bg-[#0B0D0C] p-2 rounded border border-[#E2E8E4] dark:border-[#1F2421] mb-2 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6] shrink-0 mt-0.5" />
        <span className="leading-tight">
          <strong className="text-[#111815] dark:text-[#F1F3F1]">Direct Onsite:</strong> Water evaporated in datacenter chillers. <strong className="text-[#111815] dark:text-[#F1F3F1]">Upstream Grid:</strong> Water used at power plants generating the electricity.
        </span>
      </div>

      {/* Chart Canvas */}
      <div ref={chartRef} className="w-full h-48" />

      {/* Footer Metrics */}
      <div className="pt-3 mt-2 border-t border-[#E2E8E4] dark:border-[#1F2421] text-[10px] font-mono text-[#64748B] dark:text-[#8D9690] flex items-center justify-between">
        <span>Total Water Diverted: {round(onsiteWithdrawal + upstreamWithdrawal)} mL</span>
        <span className="text-[#2563EB] dark:text-[#60A5FA] font-bold">
          Evaporative Net Loss: {round(onsiteConsumption + upstreamConsumption)} mL
        </span>
      </div>
    </div>
  );
}
