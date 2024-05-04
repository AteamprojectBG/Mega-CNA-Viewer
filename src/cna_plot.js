import * as echarts from 'npm:echarts';
import ChartOption from './chart_option.js';

class CNAPlot {
    constructor(id, tdTable, dataTable) {
        this.tdTable = tdTable;
        this.dataTable = dataTable;
        this.pattern = /^chr([1-9XY]|1[0-9]|2[0-2])(:\d+:\d+|$)/g;
        const chartDom = document.getElementById(id);
        this.chart = echarts.init(chartDom);
        window.addEventListener('resize', this.chart.resize);
        const chartOption = new ChartOption(tdTable, dataTable);
        this.chart.setOption(chartOption.getOption());
        // this.chart.on('brushSelected', function(params){
        //     console.log(params);
        // });
    }

    #getFilteredData = (chr, posStart, posEnd) => {
        if (posStart && posEnd) {
            return this.dataTable.filter(
                (row) => row.chr === chr && +row.pos >= +posStart && +row.pos <= +posEnd,
            );
        }
        
        return this.dataTable.filter((row) => row.chr === chr);
    };

    #validatePosition = (position) => {
        if (!position.match(this.pattern)) {
            return false;
        }
      
        return true;
    };

    updateDataTable = (dataTable) => {
        this.dataTable = dataTable;
    };

    rerenderPlot = (position='') => {
        if (!position.length) {
            const chartOption = new ChartOption(this.tdTable, this.dataTable);
            this.chart.setOption(chartOption.getOption());
            return '';
        }
        
        if (!this.#validatePosition(position)) {
            return 'Invalid pattern';
        }
        
        const [chr, posStart, posEnd] = position.split(':');
        
        if (posEnd - posStart < 0) {
            return 'The start position must be greater than the end position';
        }
        
        const dataTableFiltered = this.#getFilteredData(
            chr,
            posStart,
            posEnd,
        );

        const chartOption = new ChartOption(this.tdTable, dataTableFiltered);
        this.chart.setOption(chartOption.getOption());
        return '';
    };
}

export default CNAPlot;