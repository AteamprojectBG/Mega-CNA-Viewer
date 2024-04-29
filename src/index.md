---
theme: parchment
title: CNA Viewer
toc: false
---

<style>
* {
  margin: 0;
  padding: 0;
}

#chart {
  position: relative;
  height: 80vh;
  overflow: hidden;
}

.baf-title {
  position: absolute;
  left: 50%;
  top: 5%;
  transform: translate(-5%, -50%);
}

.dr-title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>

```js
import * as echarts from "npm:echarts";
import CNATable from "./cna_table.js"

const ppForm = view(Inputs.form({
  purity: Inputs.text({
    label: "Purity",
    placeholder: "Enter purity",
    value: "0.83",
    pattern: "\\d+\\.*?\\d*?",
    required: true,
    submit: true
  }),
  ploidy: Inputs.text({
    label: "Ploidy",
    placeholder: "Enter ploidy",
    value: "2",
    pattern: "\\d+\\.*?\\d*?",
    required: true,
    submit: true
  }),
  copy_numbers: Inputs.text({
    label: "Ploidy",
    placeholder: "Enter numbers of copies",
    value: "2,3,4",
    pattern: "(\\d+,?){1,}",
    required: true,
    submit: true
  }),
}));

const cnTable = await FileAttachment("data/cn_df.csv").csv();
const scatterBafData = cnTable.map((row, index) => [index, row.BAF]);
const scatterDrData = cnTable.map((row, index) => [index, row.DR]);

const tdTable = await FileAttachment("data/teorethical_distribution.csv").csv();
const lineLength = cnTable.length;
const uniqueDR = [...new Set(tdTable.map(row => row.DR))];
const uniqueTotal = [...new Set(tdTable.map(row => row.total))];
const groupedBAF = Object.groupBy(tdTable, ({ BAF }) => BAF);
const uniqueBAF = Object.keys(groupedBAF).map(item => {
  return {
    baf: item,
    fraction: groupedBAF[item].map(row => `${row.minor}/${row.total}`).join(' '),
  }
});

const bafLines = uniqueBAF.map((item, index) => {
  return {
    type: 'line',
    tooltip: {
      show: false,
    },
    xAxisIndex: 0,
    yAxisIndex: 0,
    symbol: 'none',
    lineStyle: {
      color: '#888',
      type: 'dashed',
    },
    endLabel: {
      show: true,
      formatter: () => item.fraction,
    },
    data: [
      [0, item.baf],
      [lineLength, item.baf],
    ],
  }
});

const drLines = uniqueDR.map((yValue, index) => {
  return {
    type: 'line',
    tooltip: {
      show: false,
    },
    symbol: 'none',
    xAxisIndex: 1,
    yAxisIndex: 1,
    lineStyle: {
      color: '#888',
      type: 'dashed',
    },
    endLabel: {
      show: true,
      formatter: () => uniqueTotal[index],
    },
    data: [
      [0, yValue],
      [lineLength, yValue],
    ],
  }
});

const chartDom = document.getElementById('chart');
const chart = echarts.init(chartDom);
window.addEventListener('resize', chart.resize);

chart.setOption({
  legend: {},
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    },
  },
  axisPointer: {
    link: { xAxisIndex: 'all' },
  },
  xAxis: [
    { gridIndex: 0 },
    { gridIndex: 1 }
  ],
  yAxis: [{ gridIndex: 0, max: 0.6 }, { gridIndex: 1 }],
  grid: [{ bottom: '55%' }, { top: '55%' }],
  dataZoom: [
    {
      type: 'inside',
      start: 0,
      end: 10,
      xAxisIndex: [0, 1],
      filterMode: 'none'
    },
    {
      start: 0,
      end: 10,
      xAxisIndex: [0, 1],
      filterMode: 'none'
    }
  ],
  series: [
    {
      type: 'scatter',
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: scatterBafData,
    },
    {
      type: 'scatter',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: scatterDrData,
    },
    ...bafLines,
    ...drLines,
  ]
});
```

```js

function process_form(form){
  return [Number(form.purity), Number(form.ploidy), form.copy_numbers.split(',').filter(i => i !='' ).map(Number)]
}
const args = process_form(ppForm)
const cnt = new CNATable(...args).table
display(cnt)
```

<section>
  <div class="baf-title">BAF</div>
  <div class="dr-title">DR</div>
  <div id="chart"></div>
</section
