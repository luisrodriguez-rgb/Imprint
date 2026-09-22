import type { EChartsOption } from 'echarts';

export const ECHARTS_DARK_THEME: EChartsOption = {
  backgroundColor: 'transparent',
  textStyle: {
    color: '#8D9690',
    fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
  },
  title: {
    textStyle: {
      color: '#F1F3F1',
      fontWeight: 'bold',
      fontSize: 13,
    },
    subtextStyle: {
      color: '#8D9690',
      fontSize: 11,
    },
  },
  tooltip: {
    backgroundColor: '#111513',
    borderColor: '#29302C',
    borderWidth: 1,
    textStyle: {
      color: '#F1F3F1',
      fontSize: 11,
      fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
    },
    padding: [8, 12],
    extraCssText: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); border-radius: 6px;',
  },
  grid: {
    top: 35,
    right: 20,
    bottom: 30,
    left: 45,
  },
  categoryAxis: {
    axisLine: {
      lineStyle: {
        color: '#29302C',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#8D9690',
      fontSize: 10,
    },
    splitLine: {
      show: false,
    },
  },
  valueAxis: {
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#8D9690',
      fontSize: 10,
    },
    splitLine: {
      lineStyle: {
        color: '#171B19',
        type: 'dashed',
      },
    },
  },
  color: [
    '#A8D5BA', // Mineral primary
    '#D8B878', // Warm amber
    '#6FB58A', // Strong green
    '#3B82F6', // Cobalt
    '#8B5CF6', // Violet
    '#EC4899', // Pink
  ],
};
