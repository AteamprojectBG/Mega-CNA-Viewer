---
theme: parchment
title: CNA Viewer
toc: false
---

<link rel="stylesheet" href="./assets/style.css">
<link rel="stylesheet" href="./assets/tabulator_bulma.min.css">

```js
const annotation = await FileAttachment("./data/ann.tsv").tsv({typed: true, array: true,});
```

```js
import CNATable from './utils/cna_table.js';
import findMatch from './utils/matching.js';
import annotate from './utils/annotation.js';
import * as parser from './utils/parser.js';
import CNAPlot from './plot/index.js';

const dataTable = Mutable([]);
const formValues = Mutable([]);

const initialValues = {
    purity: 0.83,
    tumorPloidy: 2,
    normalPloidy: 2,
    copyNumbers: "0,1,2,3,4,5,6,7,8",
  }

const purityInput = html`<input id="purityInput" type="number" placeholder="Enter purity" value="${initialValues.purity}" min="0" required/>`

const tumorPloidyInput = html`<input id="tumorPloidyInput" type="number" placeholder="Enter tumor ploidy" value="${initialValues.tumorPloidy}" min="0" required/>`

const normalPloidyInput = html`<input id="normalPloidyInput" type="number" placeholder="Enter normal ploidy" value="${initialValues.normalPloidy}" min="0" required/>`

const copyNumbersInput = html`<input id="copyNumbersInput" type="text" placeholder="Enter copy numbers" value="${initialValues.copyNumbers}" pattern="(\d+,?){1,}" title="List numbers separated by commas" required/>`

// const inputFile = html`<input id="fileInput" type="file" accept=".csv, .tsv, .txt" required/>`
const inputFile = Inputs.file({
  accept: '.csv, .tsv, .txt',
  required: true,
})
inputFile.querySelector('input').setAttribute('id', 'fileInput')

const purityGen = Generators.input(purityInput);
const tumorPloidyGen = Generators.input(tumorPloidyInput);
const normalPloidyGen = Generators.input(normalPloidyInput);
const copyNumbersGen = Generators.input(copyNumbersInput);
const inputFileGen = Generators.input(inputFile)
```

```js
document.getElementById('export-btn').addEventListener('click', () => cnaPlot.exportData());
document.getElementById('clear-btn').addEventListener('click', () => cnaPlot.clearData());
```

```js
function countOccurrences(string, char) {
    return string.split(char).length - 1;
}

if(inputFileGen.name.endsWith('.csv')){
  dataTable.value = await inputFile.value.csv({ typed: false });
} else if (inputFileGen.name.endsWith('.tsv')) {
  dataTable.value = await inputFile.value.tsv({ typed: false });
} else if (inputFileGen.name.endsWith('.txt')) {
  let t = await inputFileGen.text()
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
    dataTable.value = await inputFile.value.csv({ typed: false });
  }
  if(tSplit[0] > 1 && tSplit.every((e, arr) => e === tSplit[0])){
    dataTable.value = await inputFile.value.tsv({ typed: false });
  }
}

dataTable.value = parser.parseData(dataTable.value).map(element => findMatch(element, tdTable));
annotate(dataTable.value, annotation)
dataTable.value = dataTable.value.sort((a, b) => {
  return a.chr.localeCompare(b.chr, undefined, {
    numeric: true,
    sensitivity: 'base'
  });
});
console.log("DATA:")
console.log(dataTable.value)
cnaPlot.updateDataTable(dataTable.value);
positionInput.value = '';
rerenderPlot();
```

```js
  const formData = {
    purity: isNaN(purityGen) ? '0' : purityGen,
    tumorPloidy: isNaN(tumorPloidyGen) ? '0' : tumorPloidyGen,
    normalPloidy: isNaN(normalPloidyGen) ? '0' : normalPloidyGen,
    copyNumbers: copyNumbersGen === '' ? '0' : copyNumbersGen,
  }

  formValues.value = parser.parseForm(formData);
  dataTable.value = await FileAttachment('data/cn_df.csv').csv(); // load sample data
  annotate(dataTable.value, annotation);
  const tdTable = new CNATable(...formValues.value).table;
  console.log(dataTable.value);
  console.log(tdTable); // для дебага пусть пока висит
  const cnaPlot = new CNAPlot('chart', 'table', tdTable, dataTable.value);
```

```js
const positionInput = html`<input id="chrInput" type="text" placeholder="chrN:0000-0000" />`;
const position = Generators.input(positionInput);

const rerenderPlot = (currentPosition='') => {
  const status = cnaPlot.rerenderPlot(currentPosition);
  return status;
};
```

```js
// const clrBtn = html`<button class="clear" type="button">&#x2715;</button>`
const clearBtn = document.querySelector(".clearBtn")
clearBtn.addEventListener("click", (e) => {
  const input = document.querySelector("input#chrInput")
  input.value = ""
  rerenderPlot()
})
```

<div class="main-section">
  <div class="sidebar card-item">
    <div class="inputForm">
      <h3>Settings:</h3>
      <div><label for="purityInput">Purity</label>${purityInput}</div>
      <div><label for="tumorPloidyInput">Tumor ploidy</label>${tumorPloidyInput}</div>
      <div><label for="normalPloidyInput">Normal ploidy</label>${normalPloidyInput}</div>
      <div><label for="copyNumbersInput">Copy numbers</label>
      ${copyNumbersInput}
      <div class="error-msg">Invalid pattern</div>
      </div>
    </div>
    <div class="chr-input inputForm">
      <h3>Search:</h3>
      <div>
      <label for="chrInput">Chromosome position</label>
      <div class="positionContainer">
      ${positionInput} <button class="clearBtn" type="button">&#x2715;</button>
      </div>
      <div class="error-msg">${rerenderPlot(position)}</div>
      </div>
    </div>
    <div class="inputForm">
      <h3>Data:</h3>
      <div>${inputFile}<label for="fileInput">Load data</label></div>
      <div id="filename">${inputFileGen.name}</div>
    </div>
  </div>
  <div class="plot">
    <section class="chart-section card-item">
      <div class="baf-title">BAF</div>
      <div class="dr-title">DR</div>
      <div id="chart" class="chart"></div>
    </section>
    <section class="card-item">
      <div id="table"></div>
      <div class="action">
        <button id="clear-btn">Clear</button>
        <button id="export-btn">Export</button>
      </div>
    </section>
  </div>
</div>
