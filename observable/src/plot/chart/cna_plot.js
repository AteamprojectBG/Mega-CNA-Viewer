/**
 * @file Chart plot class.
 */

import * as echarts from 'npm:echarts';
import ChartOption from './chart_option.js';
import SegmentTable from './segment_table.js';

/** Class creates a plot of BAF, DR and theoretical distribution. */
class CNAPlot {
    #pattern = /^chr([1-9XY]|1[0-9]|2[0-2])(:\d+[-]\d+|$)/g;

    /**
    * Chart plot constructor.
    * @param {string} chartId - Chart chartId.
    * @param {Array} tdTable - Theoretical distribution.
    * @param {Array} dataTable - Loaded data.
    */
    constructor(chartId, tableId, tdTable, dataTable) {
        this.chartId = chartId;
        this.tableId = tableId;
        this.tdTable = tdTable;
        this.dataTable = dataTable;
        
        const chartDom = document.getElementById(chartId);
        this.chart = echarts.init(chartDom);
        window.addEventListener('resize', this.chart.resize);
        const chartOption = new ChartOption(tdTable, dataTable);
        this.chart.setOption(chartOption.getOption());

        this.segmentTableData = [];
        this.segmentTable = new SegmentTable(tableId, this.chart, tdTable, dataTable, this.segmentTableData);
    }

    /**
     * Returns filtered data.
     * @param {string} chr - Chromosome name.
     * @param {number} posStart - Segment starting position index.
     * @param {number} posEnd - Segment end position index.
     * @returns {Array} - Filtered data.
     */
    #getFilteredData = (positionEntity) => {
        if (positionEntity.posStart && positionEntity.posEnd) {
            return this.dataTable.filter(
                (row) => row.chr === positionEntity.chr &&
                +row.pos >= +positionEntity.posStart &&
                +row.pos <= +positionEntity.posEnd
            );
        }
        
        return this.dataTable.filter((row) => row.chr === positionEntity.chr);
    };

    /**
     * Returns pattern matching status.
     * @param {string} position - Chromosome position.
     * @returns {boolean} - Pattern matching status.
     */
    #validatePosition = (position) => {
        if (!position.match(this.#pattern)) {
            return false;
        }
      
        return true;
    };

    /**
     * Updates data table.
     * @param {Array} dataTable - Loaded data.
     */
    updateDataTable = (dataTable) => {
        this.dataTable = dataTable;
    };

    /**
     * Returns message about position status.
     * @param {string} position - Chromosome position.
     * @returns {string} - Message about position status.
     */
    rerenderPlot = (position='') => {
        if (!position.length) {
            const chartOption = new ChartOption(this.tdTable, this.dataTable);
            this.chart.setOption(chartOption.getOption());
            this.segmentTable.turnOffEvents();
            this.segmentTable = new SegmentTable(this.tableId, this.chart, this.tdTable, this.dataTable, this.segmentTableData);
            return '';
        }
        
        if (!this.#validatePosition(position)) {
            return 'Invalid pattern';
        }

        const positionEntity = { chr: '', posStart: null, posEnd: null, };
        
        const [chr, positions] = position.split(':');
        positionEntity.chr = chr;
        
        if (positions) {
            const [posStart, posEnd] = positions.split('-');
            positionEntity.posStart = posStart;
            positionEntity.posEnd = posEnd;
        }
        
        if (positionEntity.posEnd - positionEntity.posStart < 0) {
            return 'The start position must be greater than the end position';
        }
        
        const dataTableFiltered = this.#getFilteredData(positionEntity);

        const chartOption = new ChartOption(this.tdTable, dataTableFiltered);
        this.chart.setOption(chartOption.getOption());
        this.segmentTable.turnOffEvents();
        this.segmentTable = new SegmentTable(this.tableId, this.chart, this.tdTable, dataTableFiltered, this.segmentTableData);
        return '';
    };

    /**
     * Downloads selected segments.
     */
    exportData = () => {
        if (!this.segmentTable.table.getDataCount()) {
            return;
        }

        this.segmentTable.table.download('csv', 'segment-table.csv');
    };

    /**
     * Clear selected segments.
     */
    clearData = () => {
        this.segmentTable.table.clearData();
    };
}

export default CNAPlot;