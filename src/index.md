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

.chart-section {
  position: relative;
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

.chr-input {
  display: grid;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.error-msg {
  color: red;
  justify-self: end;
}
</style>

```js
import * as echarts from "npm:echarts";
import CNATable from "./cna_table.js"
import ChartOption from "./chart_option.js"

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
```

```js

function process_form(form_data) {
    // Validate input
    if (!form_data || typeof form_data !== 'object') {
        throw new Error('Invalid form data');
    }

    // Parse purity and ploidy
    let purity = parseFloat(form_data.purity);
    let ploidy = parseFloat(form_data.ploidy);

    if (isNaN(purity) || isNaN(ploidy)) {
        throw new Error('Invalid purity or ploidy');
    }

    // Parse copy_numbers
    let copy_numbers = form_data.copy_numbers.split(',')
                          .map(num => parseFloat(num.trim()))
                          .filter(num => !isNaN(num));

    if (copy_numbers.length === 0) {
        throw new Error('No valid copy numbers found');
    }

    return [purity, ploidy, copy_numbers];
}

const args = process_form(ppForm)
const tdTable = new CNATable(...args).table
const cnTable = await FileAttachment("data/cn_df.csv").csv();
const chartOption = new ChartOption(tdTable, cnTable);

const chartDom = document.getElementById('chart');
const chart = echarts.init(chartDom);
window.addEventListener('resize', chart.resize);

chart.setOption(chartOption.get_option());
```

```js
const positionInput = html`<input type="text" placeholder="chrN:0000-0000">`;
const position = Generators.input(positionInput);

const regex = /^chr([1-9]|1[0-3]):\d+:\d+/g;

const validatePosition = (currentPosition) => {
  if (!currentPosition.match(regex)) {
    return false;
  }

  return true;
}

const chartRenderer = (currentPosition) => {
  if (!currentPosition.length) {
    return '';
  }

  if (!validatePosition(currentPosition)) {
    return 'Invalid pattern';
  }

  const [chr, posStart, posEnd] = currentPosition.split(':');
  const cnTableFiltered = cnTable.filter(row => (row.chr === chr && +row.pos >= +posStart && +row.pos <= +posEnd));
  const chartOption = new ChartOption(tdTable, cnTableFiltered);
  chart.setOption(chartOption.get_option());
  return '';
}
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
