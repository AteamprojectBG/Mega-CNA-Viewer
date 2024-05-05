---
theme: parchment
title: CNA Viewer
toc: false
---

<link rel="stylesheet" href="./style.css">
<link href="https://unpkg.com/tabulator-tables@6.2.1/dist/css/tabulator.min.css" rel="stylesheet">

```js
import CNATable from './cna_table.js';
import CNAPlot from './cna_plot.js';
import * as parser from './parser.js';

const dataTable = Mutable([]);
const formValues = Mutable([]);
const selectedSegmentPoitions = Mutable({});

const ppForm = view(
  Inputs.form({
    purity: Inputs.text({
      label: 'Purity',
      placeholder: 'Enter purity',
      value: '0.83',
      pattern: '\\d+\\.*?\\d*?',
      required: true,
    }),
    ploidy: Inputs.text({
      label: 'Tumor ploidy',
      placeholder: 'Enter tumor ploidy',
      value: '2',
      pattern: '\\d+\\.*?\\d*?',
      required: true,
    }),
    normal_ploidy: Inputs.text({
      label: 'Normal ploidy',
      placeholder: 'Enter normal ploidy',
      value: '2',
      pattern: '\\d+',
      required: true,
    }),
    copy_numbers: Inputs.text({
      label: 'Copy numbers',
      placeholder: 'Enter numbers of copies',
      value: '2,3,4',
      pattern: '(\\d+,?){1,}',
      required: true,
    }),
  }),
);

const csvfile = view(
  Inputs.file({ label: 'Load CSV file', accept: '.csv, .txt', required: true }),
);
```

```js
dataTable.value = await FileAttachment('data/cn_df.csv').csv(); // load sample data
formValues.value = parser.parseForm(ppForm);
const tdTable = new CNATable(...formValues.value).table;
display(tdTable); // для дебага пусть пока висит
const cnaPlot = new CNAPlot('chart', 'table', tdTable, dataTable.value);
```

```js
const positionInput = html`<input type="text" placeholder="chrN:0000-0000" />`;
const position = Generators.input(positionInput);

const rerenderPlot = (currentPosition='') => {
  const status = cnaPlot.rerenderPlot(currentPosition);
  return status;
};

const selected = Generators.input(selectedSegmentPoitions.value);
const changeHandler = (v) => {
  return v;
}
```

```js
dataTable.value = await csvfile.csv({ typed: false });
dataTable.value = parser.parseData(dataTable.value);
cnaPlot.updateDataTable(dataTable.value);
positionInput.value = '';
rerenderPlot();
```

```js
document.getElementById('export-btn').addEventListener('click', () => cnaPlot.exportData());
```

<div class="card chr-input">
  <div>Chromosome position: ${positionInput}</div>
  <div class="error-msg">${rerenderPlot(position)}</div>
</div>

<section class="chart-section">
  <div class="baf-title">BAF</div>
  <div class="dr-title">DR</div>
  <div id="chart"></div>
</section>

<section>
  <div id="table"></div>
  <div class="export">
    <button id="export-btn">Export</button>
  </div>
</section>