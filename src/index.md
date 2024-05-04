---
theme: parchment
title: CNA Viewer
toc: false
---

<link rel="stylesheet" href="./style.css">

```js
import * as echarts from 'npm:echarts';
import CNATable from './cna_table.js';
import ChartOption from './chart_option.js';
import * as parser from './parser.js';

const dataTable = Mutable([]);

const ppForm = view(
  Inputs.form({
    purity: Inputs.text({
      label: 'Purity',
      placeholder: 'Enter purity',
      value: '0.83',
      pattern: '\\d+\\.*?\\d*?',
      required: true,
      submit: true,
    }),
    ploidy: Inputs.text({
      label: 'Tumor ploidy',
      placeholder: 'Enter tumor ploidy',
      value: '2',
      pattern: '\\d+\\.*?\\d*?',
      required: true,
      submit: true,
    }),
    normal_ploidy: Inputs.text({
      label: 'Normal ploidy',
      placeholder: 'Enter normal ploidy',
      value: '2',
      pattern: '\\d+',
      required: true,
      submit: true,
    }),
    copy_numbers: Inputs.text({
      label: 'Copy numbers',
      placeholder: 'Enter numbers of copies',
      value: '2,3,4',
      pattern: '(\\d+,?){1,}',
      required: true,
      submit: true,
    }),
  }),
);

const csvfile = view(
  Inputs.file({ label: 'Load CSV file', accept: '.csv, .txt', required: true }),
);
```

```js
dataTable.value = await FileAttachment('data/cn_df.csv').csv(); // load sample data
const args = parser.parseForm(ppForm);
const tdTable = new CNATable(...args).table;
display(tdTable); // для дебага пусть пока висит
const chartOption = new ChartOption(tdTable, dataTable.value);

const chartDom = document.getElementById('chart');
const chart = echarts.init(chartDom);
window.addEventListener('resize', chart.resize);

chart.setOption(chartOption.get_option());
```

```js
const positionInput = html`<input type="text" placeholder="chrN:0000-0000" />`;
const position = Generators.input(positionInput);

const pattern = /^chr([1-9XY]|1[0-9]|2[0-2])(:\d+:\d+|$)/g;

const validatePosition = (currentPosition) => {
  if (!currentPosition.match(pattern)) {
    return false;
  }

  return true;
};

const getFilteredData = (data, chr, posStart, posEnd) => {
  if (posStart && posEnd) {
    return data.filter(
      (row) => row.chr === chr && +row.pos >= +posStart && +row.pos <= +posEnd,
    );
  }

  return data.filter((row) => row.chr === chr);
};

const chartRenderer = (currentPosition) => {
  if (!currentPosition.length) {
    const chartOption = new ChartOption(tdTable, dataTable.value);
    chart.setOption(chartOption.get_option());
    return '';
  }

  if (!validatePosition(currentPosition)) {
    return 'Invalid pattern';
  }

  const [chr, posStart, posEnd] = currentPosition.split(':');

  if (posEnd - posStart < 0) {
    return 'The start position must be greater than the end position';
  }

  const dataTableFiltered = getFilteredData(
    dataTable.value,
    chr,
    posStart,
    posEnd,
  );
  const chartOption = new ChartOption(tdTable, dataTableFiltered);
  chart.setOption(chartOption.get_option());
  return '';
};
```

```js
dataTable.value = await csvfile.csv({ typed: false });
dataTable.value = parser.parseData(dataTable.value);
positionInput.value = '';
chartRenderer('');
```

<div class="card chr-input">
  <div>Chromosome position: ${positionInput}</div>
  <div class="error-msg">${chartRenderer(position)}</div>
</div>

<section class="chart-section">
  <div class="baf-title">BAF</div>
  <div class="dr-title">DR</div>
  <div id="chart"></div>
</section>
