---
theme: parchment
title: CNA Viewer
toc: false
---

<link rel="stylesheet" href="./assets/style.css">
<link rel="stylesheet" href="./assets/tabulator.min.css">

```js
import CNATable from './cna_table.js';
import CNAPlot from './cna_plot.js';
import findMatch from './matching.js';
import * as parser from './parser.js';

const dataTable = Mutable([]);
const formValues = Mutable([]);

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

const inputFile = view(
  Inputs.file({ label: 'Load a file', accept: '.csv, .tsv, .txt', required: true }),
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
```

```js
function countOccurrences(string, char) {
    return string.split(char).length - 1;
}

if(inputFile.name.endsWith('.csv')){
  dataTable.value = await inputFile.csv({ typed: false });
} else if (inputFile.name.endsWith('.tsv')) {
  dataTable.value = await inputFile.tsv({ typed: false });
} else if (inputFile.name.endsWith('.txt')) {
  console.log('TXT LOADED')
  let t = await inputFile.text()
  const lines = t.split('\n')
  let cSplit = []
  let tSplit = []
  for(let line of lines){
    if (line.length > 0){
      cSplit.push(countOccurrences(line, ','))
      tSplit.push(countOccurrences(line, '\t'))
    }
  }

  if(cSplit[0] > 1 && cSplit.every((e, arr) => e === cSplit[0])){
    dataTable.value = await inputFile.csv({ typed: false });
  }
  if(tSplit[0] > 1 && tSplit.every((e, arr) => e === tSplit[0])){
    dataTable.value = await inputFile.tsv({ typed: false });
  }
}

dataTable.value = parser.parseData(dataTable.value).map(element => findMatch(element, tdTable));
console.log(dataTable.value)
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

<section class="table-section">
  <div id="table"></div>
  <div class="export">
    <button id="export-btn">Export</button>
  </div>
</section>